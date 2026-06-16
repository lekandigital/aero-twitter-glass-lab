import type { MaterialFieldBase, MaterialSelectOption } from './MaterialSettingControl';

/** 0 full · 1 top half · 2 bottom half · 3 custom band */
export type FrostSurfaceRegion = 0 | 1 | 2 | 3;

/** 0 fade down · 1 fade up · 2 fade both ways from peak */
export type FrostSurfaceDirection = 0 | 1 | 2;

export type FrostSurfaceProfileKeys = {
  frostMatte: number;
  frostMatteTexture: number;
  frostGloss: number;
  frostSurfaceRegion: FrostSurfaceRegion;
  frostSurfacePeak: number;
  frostSurfaceSpread: number;
  frostSurfaceFadeEnd: number;
  frostSurfaceSoftness: number;
  frostSurfaceDirection: FrostSurfaceDirection;
};

export const FROST_SURFACE_REGION_OPTIONS: MaterialSelectOption[] = [
  { value: 0, label: 'Full panel' },
  { value: 1, label: 'Top half' },
  { value: 2, label: 'Bottom half' },
  { value: 3, label: 'Custom band' },
];

export const FROST_SURFACE_DIRECTION_OPTIONS: MaterialSelectOption[] = [
  { value: 0, label: 'Fade downward' },
  { value: 1, label: 'Fade upward' },
  { value: 2, label: 'Fade both ways' },
];

export const FROST_SURFACE_PROFILE_DEFAULTS: Omit<FrostSurfaceProfileKeys, 'frostMatte' | 'frostMatteTexture' | 'frostGloss'> =
  {
    frostSurfaceRegion: 0,
    frostSurfacePeak: 8,
    frostSurfaceSpread: 12,
    frostSurfaceFadeEnd: 50,
    frostSurfaceSoftness: 68,
    frostSurfaceDirection: 0,
  };

/** @deprecated Legacy save keys — read via pickFrostSurfaceProfile */
export type FrostGrainProfileKeys = FrostSurfaceProfileKeys & {
  frostGrain?: number;
  frostGrainSize?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function featherStop(start: number, end: number, softness: number) {
  const t = clamp(softness, 10, 100) / 100;
  return start + (end - start) * t;
}

function prefixedKey(prefix: string, key: string) {
  if (!prefix) return key;
  return `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function readRegion(settings: Record<string, unknown>, prefix: string): FrostSurfaceRegion {
  const next = settings[prefixedKey(prefix, 'frostSurfaceRegion')];
  if (typeof next === 'number') return next as FrostSurfaceRegion;
  const legacy = settings[prefixedKey(prefix, 'frostGrainRegion')];
  return typeof legacy === 'number' ? (legacy as FrostSurfaceRegion) : 0;
}

function readNumber(
  source: Record<string, unknown>,
  prefix: string,
  key: keyof FrostSurfaceProfileKeys,
  legacyKey: string | undefined,
  fallback: number,
): number {
  const value = source[prefixedKey(prefix, key)];
  if (typeof value === 'number') return value;
  if (legacyKey) {
    const legacy = source[prefixedKey(prefix, legacyKey)];
    if (typeof legacy === 'number') return legacy;
  }
  return fallback;
}

/** Vertical alpha mask shared by matte + gloss (black = visible). */
export function buildFrostSurfaceMask(profile: FrostSurfaceProfileKeys): string | 'none' {
  if (profile.frostMatte <= 0 && profile.frostGloss <= 0) return 'none';

  const region = profile.frostSurfaceRegion ?? 0;
  if (region === 0) return 'none';

  const softness = profile.frostSurfaceSoftness ?? FROST_SURFACE_PROFILE_DEFAULTS.frostSurfaceSoftness;

  if (region === 1) {
    const core = clamp(profile.frostSurfaceSpread ?? 12, 2, 48);
    const fadeEnd = clamp(profile.frostSurfaceFadeEnd ?? 50, 20, 50);
    const feather = featherStop(core, fadeEnd, softness);
    return `linear-gradient(to bottom, #000 0%, #000 ${core}%, #000 ${feather}%, transparent ${fadeEnd}%)`;
  }

  if (region === 2) {
    const core = clamp(profile.frostSurfaceSpread ?? 12, 2, 48);
    const fadeStart = clamp(100 - (profile.frostSurfaceFadeEnd ?? 50), 50, 80);
    const coreStart = 100 - core;
    const feather = featherStop(fadeStart, coreStart, softness);
    return `linear-gradient(to bottom, transparent ${fadeStart}%, #000 ${feather}%, #000 ${coreStart}%, #000 100%)`;
  }

  const peak = clamp(profile.frostSurfacePeak ?? 8, 0, 100);
  const spread = clamp(profile.frostSurfaceSpread ?? 24, 5, 100);
  const direction = profile.frostSurfaceDirection ?? 0;

  if (direction === 0) {
    const end = Math.min(100, peak + spread);
    const feather = featherStop(peak, end, softness);
    return `linear-gradient(to bottom, #000 ${peak}%, #000 ${feather}%, transparent ${end}%)`;
  }

  if (direction === 1) {
    const start = Math.max(0, peak - spread);
    const feather = featherStop(start, peak, softness);
    return `linear-gradient(to bottom, transparent ${start}%, #000 ${feather}%, #000 ${peak}%)`;
  }

  const half = spread / 2;
  const start = Math.max(0, peak - half);
  const end = Math.min(100, peak + half);
  const featherLow = featherStop(start, peak, softness);
  const featherHigh = featherStop(peak, end, softness);
  return `linear-gradient(to bottom, transparent ${start}%, #000 ${featherLow}%, #000 ${peak}%, #000 ${featherHigh}%, transparent ${end}%)`;
}

export function frostSurfaceProfileCssVars(
  profile: FrostSurfaceProfileKeys,
  cssVarPrefix?: string,
): Record<string, string | number> {
  const mask = buildFrostSurfaceMask(profile);
  const maskValue = mask === 'none' ? 'none' : mask;
  const vars: Record<string, string | number> = {
    ...(cssVarPrefix
      ? {
          [`${cssVarPrefix}-frost-matte`]: profile.frostMatte / 100,
          [`${cssVarPrefix}-frost-matte-texture`]: `${profile.frostMatteTexture}px`,
          [`${cssVarPrefix}-frost-gloss`]: profile.frostGloss / 100,
          [`${cssVarPrefix}-frost-surface-mask`]: maskValue,
        }
      : {
          '--sheet-frost-matte': profile.frostMatte / 100,
          '--sheet-frost-matte-texture': `${profile.frostMatteTexture}px`,
          '--sheet-frost-gloss': profile.frostGloss / 100,
          '--sheet-frost-surface-mask': maskValue,
        }),
  };
  return vars;
}

type ProfileField = MaterialFieldBase<string> & {
  when?: (settings: Record<string, unknown>) => boolean;
};

/** Matte + gloss layout fields — append after frostMatte / frostMatteTexture / frostGloss. */
export function buildFrostSurfaceProfileFields(prefix: string, section: string): ProfileField[] {
  const regionKey = prefixedKey(prefix, 'frostSurfaceRegion');
  const spreadKey = prefixedKey(prefix, 'frostSurfaceSpread');
  const fadeEndKey = prefixedKey(prefix, 'frostSurfaceFadeEnd');
  const peakKey = prefixedKey(prefix, 'frostSurfacePeak');
  const softnessKey = prefixedKey(prefix, 'frostSurfaceSoftness');
  const directionKey = prefixedKey(prefix, 'frostSurfaceDirection');

  const halfRegion = (s: Record<string, unknown>) => {
    const r = readRegion(s, prefix);
    return r === 1 || r === 2;
  };
  const customRegion = (s: Record<string, unknown>) => readRegion(s, prefix) === 3;
  const zonedRegion = (s: Record<string, unknown>) => readRegion(s, prefix) !== 0;

  return [
    {
      id: regionKey,
      label: 'Surface region',
      dataType: 'select',
      section,
      options: FROST_SURFACE_REGION_OPTIONS,
      hint: 'Where matte + gloss apply. Top/bottom half fade toward the vertical center; custom band sets its own peak.',
    },
    {
      id: spreadKey,
      label: 'Surface extent',
      dataType: 'number',
      section,
      min: 2,
      max: 100,
      step: 1,
      unit: '%',
      when: zonedRegion,
      hint: 'Top/bottom half: depth of the strong band from the edge (~10% ≈ top tenth). Custom: total spread from the peak.',
    },
    {
      id: fadeEndKey,
      label: 'Fade to midline',
      dataType: 'number',
      section,
      min: 20,
      max: 50,
      step: 1,
      unit: '%',
      when: halfRegion,
      hint: 'Height where matte and gloss reach zero. 50% = vertical center.',
    },
    {
      id: peakKey,
      label: 'Surface peak',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: customRegion,
      hint: 'Strongest matte/gloss position (0 = top, 100 = bottom).',
    },
    {
      id: directionKey,
      label: 'Surface direction',
      dataType: 'select',
      section,
      options: FROST_SURFACE_DIRECTION_OPTIONS,
      when: customRegion,
      hint: 'Which way the finish falls off from the peak.',
    },
    {
      id: softnessKey,
      label: 'Surface fade softness',
      dataType: 'number',
      section,
      min: 10,
      max: 100,
      step: 1,
      unit: '%',
      when: zonedRegion,
      hint: 'Softer falloff between the solid band and the fade-out line.',
    },
  ];
}

export function frostSurfaceProfileDefaults(): Omit<
  FrostSurfaceProfileKeys,
  'frostMatte' | 'frostMatteTexture' | 'frostGloss'
> {
  return { ...FROST_SURFACE_PROFILE_DEFAULTS };
}

export function frostSurfaceProfileFieldIds(prefix: string): string[] {
  return [
    prefixedKey(prefix, 'frostSurfaceRegion'),
    prefixedKey(prefix, 'frostSurfaceSpread'),
    prefixedKey(prefix, 'frostSurfaceFadeEnd'),
    prefixedKey(prefix, 'frostSurfacePeak'),
    prefixedKey(prefix, 'frostSurfaceSoftness'),
    prefixedKey(prefix, 'frostSurfaceDirection'),
  ];
}

export function pickFrostSurfaceProfile(
  source: Record<string, unknown>,
  prefix: string,
): FrostSurfaceProfileKeys {
  return {
    frostMatte: readNumber(source, prefix, 'frostMatte', 'frostGrain', 0),
    frostMatteTexture: readNumber(source, prefix, 'frostMatteTexture', 'frostGrainSize', 160),
    frostGloss: readNumber(source, prefix, 'frostGloss', undefined, 0),
    frostSurfaceRegion: readRegion(source, prefix),
    frostSurfacePeak: readNumber(
      source,
      prefix,
      'frostSurfacePeak',
      'frostGrainPeak',
      FROST_SURFACE_PROFILE_DEFAULTS.frostSurfacePeak,
    ),
    frostSurfaceSpread: readNumber(
      source,
      prefix,
      'frostSurfaceSpread',
      'frostGrainSpread',
      FROST_SURFACE_PROFILE_DEFAULTS.frostSurfaceSpread,
    ),
    frostSurfaceFadeEnd: readNumber(
      source,
      prefix,
      'frostSurfaceFadeEnd',
      'frostGrainFadeEnd',
      FROST_SURFACE_PROFILE_DEFAULTS.frostSurfaceFadeEnd,
    ),
    frostSurfaceSoftness: readNumber(
      source,
      prefix,
      'frostSurfaceSoftness',
      'frostGrainSoftness',
      FROST_SURFACE_PROFILE_DEFAULTS.frostSurfaceSoftness,
    ),
    frostSurfaceDirection: readNumber(
      source,
      prefix,
      'frostSurfaceDirection',
      'frostGrainDirection',
      FROST_SURFACE_PROFILE_DEFAULTS.frostSurfaceDirection,
    ) as FrostSurfaceDirection,
  };
}

/** @deprecated Use pickFrostSurfaceProfile */
export const pickFrostGrainProfile = pickFrostSurfaceProfile;
/** @deprecated Use buildFrostSurfaceMask */
export const buildFrostGrainMask = buildFrostSurfaceMask;
/** @deprecated Use frostSurfaceProfileCssVars */
export const frostGrainProfileCssVars = frostSurfaceProfileCssVars;
/** @deprecated Use buildFrostSurfaceProfileFields */
export const buildFrostGrainProfileFields = buildFrostSurfaceProfileFields;
/** @deprecated Use frostSurfaceProfileDefaults */
export const frostGrainProfileDefaults = frostSurfaceProfileDefaults;
/** @deprecated Use frostSurfaceProfileFieldIds */
export const frostGrainProfileFieldIds = frostSurfaceProfileFieldIds;
