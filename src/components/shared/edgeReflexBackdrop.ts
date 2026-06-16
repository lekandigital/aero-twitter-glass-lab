export type EdgeReflexBackdropSide = 'left' | 'right';

export type EdgeReflexBackdropProfile = {
  maskGradient: string;
  tintGradient: string;
  peakAlpha: number;
  colorGain: number;
  rimColor: string;
};

type RgbSample = { r: number; g: number; b: number; luma: number };

type WallpaperSampler = {
  sampleAt: (viewportX: number, viewportY: number) => RgbSample | null;
};

const WALLPAPER_SELECTOR = '.aero-wallpaper__image:not(.aero-wallpaper__image--reference)';
const SAMPLE_COUNT = 36;
const SAMPLE_OFFSET_PX = 5;
const SAMPLE_OFFSETS_PX = [0, 4];
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
    x: Math.min(img.naturalWidth - 1, Math.max(0, Math.floor((relX / renderedW) * img.naturalWidth))),
    y: Math.min(img.naturalHeight - 1, Math.max(0, Math.floor((relY / renderedH) * img.naturalHeight))),
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
      const i = (mapped.y * img.naturalWidth + mapped.x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      return { r, g, b, luma: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 };
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
  const edgeX = side === 'left' ? rect.left : rect.right;

  const samples: RgbSample[] = [];
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const t = i / Math.max(1, SAMPLE_COUNT - 1);
    const y = spanTop + spanHeight * t;
    let best: RgbSample = { r: 0, g: 0, b: 0, luma: 0 };

    for (const offset of SAMPLE_OFFSETS_PX) {
      const sampleX =
        side === 'left' ? edgeX - SAMPLE_OFFSET_PX - offset : edgeX + SAMPLE_OFFSET_PX + offset;
      const sample = sampler.sampleAt(sampleX, y);
      if (sample && sample.luma > best.luma) {
        best = sample;
      }
    }

    samples.push(best);
  }
  return samples;
}

function sharpenGate(alpha: number): number {
  if (alpha <= 0.06) return 0;
  return Math.min(1, Math.pow(alpha, 2.15));
}

function colorIntensity(luma: number, gate: number, lightStrength: number): number {
  const light = Math.min(2, Math.max(0, lightStrength));
  const lumaGain = smoothstep(0.14, 0.62, luma);
  return Math.min(1, gate * lumaGain * (0.42 + light * 0.48));
}

function sampleColor(sample: RgbSample, intensity: number): { r: number; g: number; b: number } {
  const lift = 0.08 + intensity * 0.72;
  const chroma = 0.92 + sample.luma * 0.28;
  return {
    r: Math.min(255, Math.round(sample.r * chroma + (255 - sample.r) * lift)),
    g: Math.min(255, Math.round(sample.g * chroma + (255 - sample.g) * lift)),
    b: Math.min(255, Math.round(sample.b * chroma + (255 - sample.b) * lift)),
  };
}

function buildProfileFromSamples(samples: RgbSample[], lightStrength: number): EdgeReflexBackdropProfile {
  const lumas = samples.map((sample) => sample.luma);
  const localizationBlur = 2;
  const smoothedLumas = blur1d(lumas, localizationBlur);

  const gates = smoothedLumas.map((luma, index) => {
    const localWindow = 3;
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
    const peak = smoothstep(0.4, 0.74, luma);
    const combined = absolute * (0.5 + relative * 0.5) + peak * 0.18;
    return sharpenGate(Math.min(1, combined));
  });

  const peakAlpha = Math.max(...gates);
  const maskStops = gates.map((gate, index) => {
    const pct = (index / (samples.length - 1)) * 100;
    return `rgba(0,0,0,${gate.toFixed(3)}) ${pct.toFixed(2)}%`;
  });

  const tintStops = samples.map((sample, index) => {
    const gate = gates[index];
    const intensity = colorIntensity(sample.luma, gate, lightStrength);
    if (intensity <= 0.01) {
      const pct = (index / (samples.length - 1)) * 100;
      return `rgba(0,0,0,0) ${pct.toFixed(2)}%`;
    }
    const { r, g, b } = sampleColor(sample, intensity);
    const pct = (index / (samples.length - 1)) * 100;
    return `rgba(${r},${g},${b},${Math.min(1, intensity * 1.42).toFixed(3)}) ${pct.toFixed(2)}%`;
  });

  const brightest = samples.reduce((best, sample, index) =>
    gates[index] * sample.luma > best.score ? { score: gates[index] * sample.luma, sample } : best,
  { score: 0, sample: samples[0] });
  const rim = sampleColor(brightest.sample, Math.min(1, 0.35 + peakAlpha * 0.65));

  return {
    maskGradient: `linear-gradient(to bottom, ${maskStops.join(', ')})`,
    tintGradient: `linear-gradient(to bottom, ${tintStops.join(', ')})`,
    peakAlpha,
    colorGain: Math.min(1, peakAlpha * (0.35 + Math.min(2, lightStrength) * 0.4)),
    rimColor: `rgb(${rim.r}, ${rim.g}, ${rim.b})`,
  };
}

const FULL_EDGE_PROFILE: EdgeReflexBackdropProfile = {
  maskGradient: 'linear-gradient(to bottom, #000 0%, #000 100%)',
  tintGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  peakAlpha: 1,
  colorGain: 1,
  rimColor: '#ffffff',
};

const EMPTY_EDGE_PROFILE: EdgeReflexBackdropProfile = {
  maskGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  tintGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
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
