export type EdgeReflexBackdropSide = 'left' | 'right';

export type EdgeReflexBackdropProfile = {
  tintImage: string | null;
  spotMaskImage: string | null;
  peakAlpha: number;
  colorGain: number;
  rimColor: string;
};

type RgbSample = { r: number; g: number; b: number; luma: number };

type WallpaperSampler = {
  sampleAt: (viewportX: number, viewportY: number) => RgbSample | null;
};

const WALLPAPER_SELECTOR = '.aero-wallpaper__image:not(.aero-wallpaper__image--reference)';
const MIN_SAMPLE_COUNT = 80;
const MAX_SAMPLE_COUNT = 160;
const SAMPLE_SPACING_PX = 2.75;
const SAMPLE_OFFSET_PX = 5;
const HORIZONTAL_OFFSETS_PX = [0, 3, 7, 12];
const LOCAL_LIFT_FLOOR = 0.028;
const LOCAL_LIFT_CEIL = 0.12;
const MIN_PEAK_LUMA = 0.1;
const SPOT_TINT_CANVAS_WIDTH = 52;
const MAX_SPOTS = 7;
const MIN_SPOT_GAP_PCT = 7.5;

let wallpaperSampler: WallpaperSampler | null = null;
let wallpaperSamplerSrc = '';

export const EMPTY_EDGE_PROFILE: EdgeReflexBackdropProfile = {
  tintImage: null,
  spotMaskImage: null,
  peakAlpha: 0,
  colorGain: 0,
  rimColor: '#ffffff',
};

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

function colorIntensity(luma: number, gate: number, lightStrength: number): number {
  const light = Math.min(2, Math.max(0, lightStrength));
  const lumaGain = smoothstep(0.18, 0.56, luma);
  return Math.min(1, gate * lumaGain * (0.34 + light * 0.38));
}

function sampleColor(sample: RgbSample, intensity: number): { r: number; g: number; b: number } {
  const lift = 0.06 + intensity * 0.58;
  const chroma = 0.94 + sample.luma * 0.22;
  return {
    r: Math.min(255, Math.round(sample.r * chroma + (255 - sample.r) * lift)),
    g: Math.min(255, Math.round(sample.g * chroma + (255 - sample.g) * lift)),
    b: Math.min(255, Math.round(sample.b * chroma + (255 - sample.b) * lift)),
  };
}

function indexToPct(index: number, count: number): number {
  return count <= 1 ? 50 : (index / (count - 1)) * 100;
}

type BackdropSpot = {
  yPct: number;
  sample: RgbSample;
  strength: number;
};

function computeLocalLiftGates(samples: RgbSample[]): number[] {
  const lumas = samples.map((sample) => sample.luma);
  const window = Math.max(4, Math.round(samples.length * 0.028));

  return lumas.map((luma, index) => {
    if (luma < MIN_PEAK_LUMA) return 0;

    let localSum = 0;
    let localCount = 0;
    for (let offset = -window; offset <= window; offset += 1) {
      const j = Math.min(samples.length - 1, Math.max(0, index + offset));
      localSum += lumas[j];
      localCount += 1;
    }

    const localAvg = localSum / localCount;
    const lift = luma - localAvg;
    if (lift < LOCAL_LIFT_FLOOR) return 0;

    const relative = smoothstep(LOCAL_LIFT_FLOOR, LOCAL_LIFT_CEIL, lift);
    const prominence = lift / Math.max(localAvg, 0.05);
    const prominenceGate = smoothstep(0.1, 0.28, prominence);
    return Math.min(1, relative * prominenceGate);
  });
}

function detectBackdropSpots(samples: RgbSample[], gates: number[]): BackdropSpot[] {
  const peaks: BackdropSpot[] = [];

  for (let i = 0; i < gates.length; i += 1) {
    if (gates[i] < 0.3) continue;

    const prev = gates[i - 1] ?? 0;
    const next = gates[i + 1] ?? 0;
    if (gates[i] < prev || gates[i] < next) continue;

    const prominence = gates[i] - Math.max(prev, next);
    if (prominence < 0.07 && gates[i] < 0.5) continue;

    peaks.push({
      yPct: indexToPct(i, samples.length),
      sample: samples[i],
      strength: gates[i],
    });
  }

  if (peaks.length === 0) return [];

  peaks.sort((a, b) => b.strength - a.strength);
  const kept: BackdropSpot[] = [];

  for (const peak of peaks) {
    const tooClose = kept.some((existing) => Math.abs(existing.yPct - peak.yPct) < MIN_SPOT_GAP_PCT);
    if (tooClose) continue;
    kept.push(peak);
    if (kept.length >= MAX_SPOTS) break;
  }

  kept.sort((a, b) => a.yPct - b.yPct);
  return kept;
}

type SpotRadii = {
  vRadius: number;
  hRadius: number;
  maskVRadius: number;
};

function spotRadii(strength: number, canvasWidth: number, canvasHeight: number): SpotRadii {
  const vRadius = Math.min(14 + strength * 16, canvasHeight * 0.042);
  const hRadius = canvasWidth * (1.55 + strength * 0.35);
  const maskVRadius = Math.min(vRadius * 1.08, canvasHeight * 0.046);
  return { vRadius, hRadius, maskVRadius };
}

function withSpotClip(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  y: number,
  vRadius: number,
  draw: () => void,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y - vRadius * 1.12, ctx.canvas.width, vRadius * 2.24);
  ctx.clip();
  ctx.translate(anchorX, y);
  draw();
  ctx.restore();
}

function drawSpotMask(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  spot: BackdropSpot,
  side: EdgeReflexBackdropSide,
) {
  const y = (spot.yPct / 100) * canvasHeight;
  const anchorX = side === 'left' ? 0 : canvasWidth;
  const { maskVRadius, hRadius } = spotRadii(spot.strength, canvasWidth, canvasHeight);
  const scaleX = hRadius / maskVRadius;

  withSpotClip(ctx, anchorX, y, maskVRadius, () => {
    ctx.scale(scaleX, 1);
    const grad = ctx.createRadialGradient(0, 0, maskVRadius * 0.08, 0, 0, maskVRadius);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.42, 'rgba(255,255,255,0.72)');
    grad.addColorStop(0.78, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-maskVRadius * 1.2, -maskVRadius * 1.2, maskVRadius * 2.4, maskVRadius * 2.4);
  });
}

function drawSpotTint(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  spot: BackdropSpot,
  side: EdgeReflexBackdropSide,
  lightStrength: number,
) {
  const intensity = colorIntensity(spot.sample.luma, spot.strength, lightStrength);
  if (intensity <= 0.03) return;

  const { r, g, b } = sampleColor(spot.sample, intensity);
  const y = (spot.yPct / 100) * canvasHeight;
  const anchorX = side === 'left' ? 0 : canvasWidth;
  const { vRadius, hRadius } = spotRadii(spot.strength, canvasWidth, canvasHeight);
  const scaleX = hRadius / vRadius;

  const rimAlpha = Math.min(0.58, intensity * 0.62);
  const fillAlpha = Math.min(0.16, intensity * 0.18);

  withSpotClip(ctx, anchorX, y, vRadius, () => {
    ctx.scale(scaleX, 1);

    const rim = ctx.createRadialGradient(0, 0, vRadius * 0.04, 0, 0, vRadius * 0.72);
    rim.addColorStop(0, `rgba(${r},${g},${b},${rimAlpha})`);
    rim.addColorStop(0.34, `rgba(${r},${g},${b},${rimAlpha * 0.42})`);
    rim.addColorStop(0.62, `rgba(${r},${g},${b},${fillAlpha * 0.35})`);
    rim.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rim;
    ctx.fillRect(-vRadius * 1.3, -vRadius * 1.15, vRadius * 2.6, vRadius * 2.3);

    const diffuse = ctx.createRadialGradient(0, 0, vRadius * 0.18, 0, 0, vRadius * 1.05);
    diffuse.addColorStop(0, `rgba(${r},${g},${b},${fillAlpha})`);
    diffuse.addColorStop(0.55, `rgba(${r},${g},${b},${fillAlpha * 0.42})`);
    diffuse.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = diffuse;
    ctx.fillRect(-vRadius * 1.5, -vRadius * 1.15, vRadius * 3, vRadius * 2.3);
  });
}

function createSpotCanvas(spanHeight: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
} | null {
  const dpr = typeof window !== 'undefined' ? Math.min(3, window.devicePixelRatio || 1) : 1;
  const height = Math.max(1, Math.round(spanHeight * dpr));
  const width = Math.round(SPOT_TINT_CANVAS_WIDTH * dpr);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx, width, height };
}

function renderSpotMaskCanvas(
  spots: BackdropSpot[],
  spanHeight: number,
  side: EdgeReflexBackdropSide,
): string | null {
  if (spots.length === 0) return null;

  const surface = createSpotCanvas(spanHeight);
  if (!surface) return null;

  const { canvas, ctx, width, height } = surface;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  for (const spot of spots) {
    drawSpotMask(ctx, width, height, spot, side);
    ctx.globalCompositeOperation = 'lighter';
  }

  return canvas.toDataURL('image/png');
}

function renderSpotTintCanvas(
  spots: BackdropSpot[],
  spanHeight: number,
  side: EdgeReflexBackdropSide,
  lightStrength: number,
): string | null {
  if (spots.length === 0) return null;

  const surface = createSpotCanvas(spanHeight);
  if (!surface) return null;

  const { canvas, ctx, width, height } = surface;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  for (const spot of spots) {
    drawSpotTint(ctx, width, height, spot, side, lightStrength);
    ctx.globalCompositeOperation = 'screen';
  }

  return canvas.toDataURL('image/png');
}

function buildProfileFromSamples(
  samples: RgbSample[],
  spanHeight: number,
  lightStrength: number,
  side: EdgeReflexBackdropSide,
): EdgeReflexBackdropProfile {
  const gates = computeLocalLiftGates(samples);
  const spots = detectBackdropSpots(samples, gates);

  if (spots.length === 0) {
    return EMPTY_EDGE_PROFILE;
  }

  const spotMaskImage = renderSpotMaskCanvas(spots, spanHeight, side);
  const tintImage = renderSpotTintCanvas(spots, spanHeight, side, lightStrength);
  if (!spotMaskImage || !tintImage) {
    return EMPTY_EDGE_PROFILE;
  }

  const peakAlpha = spots.reduce((max, spot) => Math.max(max, spot.strength), 0);
  const brightest = spots.reduce((best, spot) =>
    spot.strength * spot.sample.luma > best.score
      ? { score: spot.strength * spot.sample.luma, sample: spot.sample }
      : best,
  { score: 0, sample: spots[0].sample });
  const rim = sampleColor(brightest.sample, Math.min(1, 0.2 + peakAlpha * 0.42));

  return {
    tintImage,
    spotMaskImage,
    peakAlpha,
    colorGain: Math.min(1, peakAlpha * (0.18 + Math.min(2, lightStrength) * 0.22)),
    rimColor: `rgb(${rim.r}, ${rim.g}, ${rim.b})`,
  };
}

export function sampleEdgeReflexBackdrop(
  element: HTMLElement,
  side: EdgeReflexBackdropSide,
  gapTop: number,
  gapBottom: number,
  lightStrength: number,
): EdgeReflexBackdropProfile {
  if (lightStrength <= 0) return EMPTY_EDGE_PROFILE;

  const sampler = getWallpaperSampler();
  if (!sampler) return EMPTY_EDGE_PROFILE;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return EMPTY_EDGE_PROFILE;

  const spanHeight = Math.max(1, rect.height - gapTop - gapBottom);
  const samples = sampleEdgeColumn(sampler, rect, side, gapTop, gapBottom);
  const peakLuma = Math.max(...blur1d(samples.map((sample) => sample.luma), 2));
  if (peakLuma < MIN_PEAK_LUMA) {
    return EMPTY_EDGE_PROFILE;
  }

  return buildProfileFromSamples(samples, spanHeight, lightStrength, side);
}
