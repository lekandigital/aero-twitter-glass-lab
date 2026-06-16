export type EdgeReflexBackdropSide = 'left' | 'right';

export type EdgeReflexBackdropProfile = {
  maskGradient: string;
  tintGradient: string;
  rimGradient: string;
  peakAlpha: number;
  colorGain: number;
  rimColor: string;
};

type RgbSample = { r: number; g: number; b: number; luma: number };

type WallpaperSampler = {
  sampleAt: (viewportX: number, viewportY: number) => RgbSample | null;
};

const WALLPAPER_SELECTOR = '.aero-wallpaper__image:not(.aero-wallpaper__image--reference)';
const MIN_SAMPLE_COUNT = 72;
const MAX_SAMPLE_COUNT = 140;
const SAMPLE_SPACING_PX = 3;
const SAMPLE_OFFSET_PX = 5;
const HORIZONTAL_OFFSETS_PX = [0, 3, 7, 12];
const LUMA_FLOOR = 0.1;
const LUMA_CEIL = 0.52;
const LOCAL_LIFT_FLOOR = 0.012;
const LOCAL_LIFT_CEIL = 0.1;
const MIN_PEAK_LUMA = 0.07;

let wallpaperSampler: WallpaperSampler | null = null;
let wallpaperSamplerSrc = '';

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function blur1d(values: number[], radius: number): number[] {
  if (radius <= 0) return values.slice();
  const kernel: number[] = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i += 1) {
    const w = Math.exp(-(i * i) / (2 * radius * radius));
    kernel.push(w);
    sum += w;
  }
  const normalized = kernel.map((w) => w / sum);
  return values.map((_, index) => {
    let acc = 0;
    for (let k = -radius; k <= radius; k += 1) {
      const j = Math.min(values.length - 1, Math.max(0, index + k));
      acc += values[j] * normalized[k + radius];
    }
    return acc;
  });
}

function computeSampleCount(spanHeight: number): number {
  return Math.min(MAX_SAMPLE_COUNT, Math.max(MIN_SAMPLE_COUNT, Math.round(spanHeight / SAMPLE_SPACING_PX)));
}

function sampleImageBilinear(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
): RgbSample {
  const cx = Math.min(width - 1, Math.max(0, x));
  const cy = Math.min(height - 1, Math.max(0, y));
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = cx - x0;
  const ty = cy - y0;

  const read = (px: number, py: number) => {
    const i = (py * width + px) * 4;
    return { r: imageData[i], g: imageData[i + 1], b: imageData[i + 2] };
  };

  const c00 = read(x0, y0);
  const c10 = read(x1, y0);
  const c01 = read(x0, y1);
  const c11 = read(x1, y1);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const r = lerp(lerp(c00.r, c10.r, tx), lerp(c01.r, c11.r, tx), ty);
  const g = lerp(lerp(c00.g, c10.g, tx), lerp(c01.g, c11.g, tx), ty);
  const b = lerp(lerp(c00.b, c10.b, tx), lerp(c01.b, c11.b, tx), ty);

  return { r, g, b, luma: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 };
}

function mapViewportToImage(
  img: HTMLImageElement,
  viewportX: number,
  viewportY: number,
): { x: number; y: number } | null {
  const rect = img.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const imageAspect = img.naturalWidth / img.naturalHeight;
  const rectAspect = rect.width / rect.height;
  let renderedW = rect.width;
  let renderedH = rect.height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > rectAspect) {
    renderedH = rect.width / imageAspect;
    offsetY = (rect.height - renderedH) / 2;
  } else {
    renderedW = rect.height * imageAspect;
    offsetX = (rect.width - renderedW) / 2;
  }

  const relX = viewportX - rect.left - offsetX;
  const relY = viewportY - rect.top - offsetY;
  if (relX < 0 || relY < 0 || relX >= renderedW || relY >= renderedH) return null;

  return {
    x: (relX / renderedW) * img.naturalWidth,
    y: (relY / renderedH) * img.naturalHeight,
  };
}

function getWallpaperSampler(): WallpaperSampler | null {
  const img = document.querySelector<HTMLImageElement>(WALLPAPER_SELECTOR);
  if (!img || !img.complete || img.naturalWidth <= 0) return null;

  if (wallpaperSampler && wallpaperSamplerSrc === img.currentSrc) {
    return wallpaperSampler;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  wallpaperSamplerSrc = img.currentSrc;
  wallpaperSampler = {
    sampleAt(viewportX, viewportY) {
      const mapped = mapViewportToImage(img, viewportX, viewportY);
      if (!mapped) return null;
      return sampleImageBilinear(imageData, img.naturalWidth, img.naturalHeight, mapped.x, mapped.y);
    },
  };

  return wallpaperSampler;
}

export function invalidateEdgeReflexBackdropCache() {
  wallpaperSampler = null;
  wallpaperSamplerSrc = '';
}

function sampleEdgeColumn(
  sampler: WallpaperSampler,
  rect: DOMRect,
  side: EdgeReflexBackdropSide,
  gapTop: number,
  gapBottom: number,
): RgbSample[] {
  const spanTop = rect.top + gapTop;
  const spanHeight = Math.max(1, rect.height - gapTop - gapBottom);
  const sampleCount = computeSampleCount(spanHeight);
  const edgeX = side === 'left' ? rect.left : rect.right;
  const horizontalSign = side === 'left' ? -1 : 1;

  const samples: RgbSample[] = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / Math.max(1, sampleCount - 1);
    const y = spanTop + spanHeight * t;

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let lumaSum = 0;
    let weightSum = 0;

    for (const offset of HORIZONTAL_OFFSETS_PX) {
      const sampleX = edgeX + horizontalSign * (SAMPLE_OFFSET_PX + offset);
      const sample = sampler.sampleAt(sampleX, y);
      if (!sample) continue;
      const weight = Math.exp(-(offset * offset) / 36);
      rSum += sample.r * weight;
      gSum += sample.g * weight;
      bSum += sample.b * weight;
      lumaSum += sample.luma * weight;
      weightSum += weight;
    }

    if (weightSum <= 0) {
      samples.push({ r: 0, g: 0, b: 0, luma: 0 });
      continue;
    }

    samples.push({
      r: rSum / weightSum,
      g: gSum / weightSum,
      b: bSum / weightSum,
      luma: lumaSum / weightSum,
    });
  }
  return samples;
}

function sharpenGate(alpha: number): number {
  if (alpha <= 0.04) return 0;
  return Math.min(1, Math.pow(alpha, 1.65));
}

function maskAlpha(gate: number): number {
  if (gate <= 0.03) return 0;
  return Math.min(1, Math.pow(gate, 0.95));
}

function colorIntensity(luma: number, gate: number, lightStrength: number): number {
  const light = Math.min(2, Math.max(0, lightStrength));
  const lumaGain = smoothstep(0.14, 0.62, luma);
  return Math.min(1, gate * lumaGain * (0.42 + light * 0.48));
}

function sampleColor(sample: RgbSample, intensity: number): { r: number; g: number; b: number } {
  const lift = 0.04 + intensity * 0.38;
  const chroma = 1.02 + sample.luma * 0.22;
  return {
    r: Math.min(255, Math.round(sample.r * chroma + (255 - sample.r) * lift)),
    g: Math.min(255, Math.round(sample.g * chroma + (255 - sample.g) * lift)),
    b: Math.min(255, Math.round(sample.b * chroma + (255 - sample.b) * lift)),
  };
}

function indexToPct(index: number, count: number): number {
  return count <= 1 ? 50 : (index / (count - 1)) * 100;
}

function buildSmoothMaskStops(gates: number[]): string[] {
  if (gates.length <= 1) {
    const alpha = maskAlpha(gates[0] ?? 0).toFixed(3);
    return [`rgba(0,0,0,${alpha}) 0%`, `rgba(0,0,0,${alpha}) 100%`];
  }

  const stops: string[] = [];
  for (let i = 0; i < gates.length - 1; i += 1) {
    const pct0 = indexToPct(i, gates.length);
    const pct1 = indexToPct(i + 1, gates.length);
    const midPct = ((pct0 + pct1) / 2).toFixed(2);
    const alpha0 = maskAlpha(gates[i]).toFixed(3);
    const midAlpha = ((maskAlpha(gates[i]) + maskAlpha(gates[i + 1])) / 2).toFixed(3);
    stops.push(`rgba(0,0,0,${alpha0}) ${pct0.toFixed(2)}%`);
    stops.push(`rgba(0,0,0,${midAlpha}) ${midPct}%`);
  }
  const lastAlpha = maskAlpha(gates[gates.length - 1]).toFixed(3);
  stops.push(`rgba(0,0,0,${lastAlpha}) 100%`);
  return stops;
}

function lerpSample(a: RgbSample, b: RgbSample, t: number): RgbSample {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    luma: a.luma + (b.luma - a.luma) * t,
  };
}

function buildSmoothTintStops(
  samples: RgbSample[],
  gates: number[],
  lightStrength: number,
): string[] {
  if (samples.length <= 1) {
    return ['rgba(0,0,0,0) 0%', 'rgba(0,0,0,0) 100%'];
  }

  const tintAt = (sample: RgbSample, gate: number, pct: number) => {
    const intensity = colorIntensity(sample.luma, gate, lightStrength);
    if (intensity <= 0.02 || maskAlpha(gate) <= 0) {
      return `rgba(0,0,0,0) ${pct.toFixed(2)}%`;
    }
    const { r, g, b } = sampleColor(sample, intensity);
    const alpha = Math.min(0.78, intensity * 0.92).toFixed(3);
    return `rgba(${r},${g},${b},${alpha}) ${pct.toFixed(2)}%`;
  };

  const stops: string[] = [];
  for (let i = 0; i < samples.length - 1; i += 1) {
    const pct0 = indexToPct(i, samples.length);
    const pct1 = indexToPct(i + 1, samples.length);
    const midPct = (pct0 + pct1) / 2;
    const midSample = lerpSample(samples[i], samples[i + 1], 0.5);
    const midGate = (gates[i] + gates[i + 1]) * 0.5;
    stops.push(tintAt(samples[i], gates[i], pct0));
    stops.push(tintAt(midSample, midGate, midPct));
  }
  stops.push(tintAt(samples[samples.length - 1], gates[gates.length - 1], 100));
  return stops;
}

function buildSmoothRimStops(
  samples: RgbSample[],
  gates: number[],
  lightStrength: number,
): string[] {
  if (samples.length <= 1) {
    return ['rgba(0,0,0,0) 0%', 'rgba(0,0,0,0) 100%'];
  }

  const rimAt = (sample: RgbSample, gate: number, pct: number) => {
    const intensity = colorIntensity(sample.luma, gate, lightStrength);
    if (intensity <= 0.03 || maskAlpha(gate) <= 0) {
      return `rgba(0,0,0,0) ${pct.toFixed(2)}%`;
    }
    const { r, g, b } = sampleColor(sample, intensity);
    const alpha = Math.min(1, intensity * 1.22).toFixed(3);
    return `rgba(${r},${g},${b},${alpha}) ${pct.toFixed(2)}%`;
  };

  const stops: string[] = [];
  for (let i = 0; i < samples.length - 1; i += 1) {
    const pct0 = indexToPct(i, samples.length);
    const pct1 = indexToPct(i + 1, samples.length);
    const midPct = (pct0 + pct1) / 2;
    const midSample = lerpSample(samples[i], samples[i + 1], 0.5);
    const midGate = (gates[i] + gates[i + 1]) * 0.5;
    stops.push(rimAt(samples[i], gates[i], pct0));
    stops.push(rimAt(midSample, midGate, midPct));
  }
  stops.push(rimAt(samples[samples.length - 1], gates[gates.length - 1], 100));
  return stops;
}

function buildProfileFromSamples(samples: RgbSample[], lightStrength: number): EdgeReflexBackdropProfile {
  const lumas = samples.map((sample) => sample.luma);
  const smoothedLumas = blur1d(lumas, 1);

  const gates = smoothedLumas.map((luma, index) => {
    const localWindow = 2;
    let localSum = 0;
    let localCount = 0;
    for (let offset = -localWindow; offset <= localWindow; offset += 1) {
      const j = Math.min(samples.length - 1, Math.max(0, index + offset));
      localSum += lumas[j];
      localCount += 1;
    }
    const localAvg = localSum / localCount;
    const lift = luma - localAvg;
    const absolute = smoothstep(LUMA_FLOOR, LUMA_CEIL, luma);
    const relative = smoothstep(LOCAL_LIFT_FLOOR, LOCAL_LIFT_CEIL, lift);
    const peak = smoothstep(0.42, 0.76, luma);
    const combined = absolute * (0.46 + relative * 0.54) + peak * 0.2;
    return sharpenGate(Math.min(1, combined));
  });

  const peakAlpha = Math.max(...gates.map(maskAlpha));
  const maskStops = buildSmoothMaskStops(gates);
  const tintStops = buildSmoothTintStops(samples, gates, lightStrength);
  const rimStops = buildSmoothRimStops(samples, gates, lightStrength);

  const brightest = samples.reduce(
    (best, sample, index) =>
      maskAlpha(gates[index]) * sample.luma > best.score
        ? { score: maskAlpha(gates[index]) * sample.luma, sample }
        : best,
    { score: 0, sample: samples[0] },
  );
  const rim = sampleColor(brightest.sample, Math.min(1, 0.3 + peakAlpha * 0.6));

  return {
    maskGradient: `linear-gradient(to bottom, ${maskStops.join(', ')})`,
    tintGradient: `linear-gradient(to bottom, ${tintStops.join(', ')})`,
    rimGradient: `linear-gradient(to bottom, ${rimStops.join(', ')})`,
    peakAlpha,
    colorGain: Math.min(1, peakAlpha * (0.45 + Math.min(2, lightStrength) * 0.45)),
    rimColor: `rgb(${rim.r}, ${rim.g}, ${rim.b})`,
  };
}

const FULL_EDGE_PROFILE: EdgeReflexBackdropProfile = {
  maskGradient: 'linear-gradient(to bottom, #000 0%, #000 100%)',
  tintGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  rimGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  peakAlpha: 1,
  colorGain: 1,
  rimColor: '#ffffff',
};

const EMPTY_EDGE_PROFILE: EdgeReflexBackdropProfile = {
  maskGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  tintGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  rimGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  peakAlpha: 0,
  colorGain: 0,
  rimColor: '#ffffff',
};

export function sampleEdgeReflexBackdrop(
  element: HTMLElement,
  side: EdgeReflexBackdropSide,
  gapTop: number,
  gapBottom: number,
  lightStrength: number,
): EdgeReflexBackdropProfile {
  if (lightStrength <= 0) return EMPTY_EDGE_PROFILE;

  const sampler = getWallpaperSampler();
  if (!sampler) return FULL_EDGE_PROFILE;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return FULL_EDGE_PROFILE;

  const samples = sampleEdgeColumn(sampler, rect, side, gapTop, gapBottom);
  const peakLuma = Math.max(...blur1d(samples.map((sample) => sample.luma), 2));
  if (peakLuma < MIN_PEAK_LUMA) {
    return EMPTY_EDGE_PROFILE;
  }

  return buildProfileFromSamples(samples, lightStrength);
}
