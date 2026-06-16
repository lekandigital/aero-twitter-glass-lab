/* Experiment Set 2 — settings + inspect (used inside Experiment Set 1) */

import type { CSSProperties } from 'react';
import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import {
  buildFrostSurfaceProfileFields,
  frostSurfaceProfileCssVars,
  frostSurfaceProfileDefaults,
  pickFrostSurfaceProfile,
} from '../shared/frostSurfaceFinish';

export const E2_SECTION_ORDER = [
  'Palette',
  'Transparent sheet',
  'Frost sheet',
] as const;

export type E2MaterialSettings = {
  colorCyan: string;
  colorBlue: string;
  colorDeep: string;
  transWidth: number;
  transHeight: number;
  transRadius: number;
  transTransparency: number;
  transBlur: number;
  transSaturate: number;
  transBrightness: number;
  transBorder: number;
  transFillTop: number;
  transFillMid: number;
  transFillBottom: number;
  transShine: number;
  transDiagonalGloss: number;
  transShineOpacity: number;
  transDepth: number;
  transInnerDepth: number;
  transOuterShadow: number;
  transShadowSpread: number;
  transGlow: number;
  frostWidth: number;
  frostHeight: number;
  frostRadius: number;
  frostOpacity: number;
  frostBlur: number;
  frostSaturate: number;
  frostBrightness: number;
  frostBorder: number;
  frostFillLight: number;
  frostFillDeep: number;
  frostShine: number;
  frostDiagonalGloss: number;
  frostShineOpacity: number;
  frostDepth: number;
  frostInnerDepth: number;
  frostOuterShadow: number;
  frostShadowSpread: number;
  frostGlow: number;
  frostMatte: number;
  frostMatteTexture: number;
  frostGloss: number;
  frostSurfaceRegion: number;
  frostSurfacePeak: number;
  frostSurfaceSpread: number;
  frostSurfaceFadeEnd: number;
  frostSurfaceSoftness: number;
  frostSurfaceDirection: number;
};

export const E2_DEFAULT_SETTINGS: E2MaterialSettings = {
  colorCyan: '#7ee8ff',
  colorBlue: '#2d8ee8',
  colorDeep: '#0a4a9a',
  transWidth: 680,
  transHeight: 420,
  transRadius: 28,
  transTransparency: 90,
  transBlur: 2,
  transSaturate: 118,
  transBrightness: 104,
  transBorder: 38,
  transFillTop: 22,
  transFillMid: 10,
  transFillBottom: 8,
  transShine: 42,
  transDiagonalGloss: 28,
  transShineOpacity: 75,
  transDepth: 55,
  transInnerDepth: 22,
  transOuterShadow: 28,
  transShadowSpread: 40,
  transGlow: 18,
  frostWidth: 400,
  frostHeight: 340,
  frostRadius: 22,
  frostOpacity: 54,
  frostBlur: 26,
  frostSaturate: 145,
  frostBrightness: 108,
  frostBorder: 58,
  frostFillLight: 48,
  frostFillDeep: 32,
  frostShine: 52,
  frostDiagonalGloss: 38,
  frostShineOpacity: 88,
  frostDepth: 62,
  frostInnerDepth: 28,
  frostOuterShadow: 34,
  frostShadowSpread: 44,
  frostGlow: 22,
  frostMatte: 0,
  frostMatteTexture: 160,
  frostGloss: 0,
  ...frostSurfaceProfileDefaults(),
};

export type E2InspectTarget = 'trans-sheet' | 'trans-shine' | 'frost-sheet' | 'frost-shine';

type SettingField = MaterialFieldBase<keyof E2MaterialSettings> & {
  when?: (settings: Record<string, unknown>) => boolean;
};

export const E2_SETTING_FIELDS: SettingField[] = [
  { id: 'colorCyan', label: 'Cyan accent', dataType: 'color', section: 'Palette' },
  { id: 'colorBlue', label: 'Blue', dataType: 'color', section: 'Palette' },
  { id: 'colorDeep', label: 'Deep blue', dataType: 'color', section: 'Palette' },

  { id: 'transWidth', label: 'Width', dataType: 'number', section: 'Transparent sheet', min: 280, max: 900, step: 4, unit: 'px' },
  { id: 'transHeight', label: 'Height', dataType: 'number', section: 'Transparent sheet', min: 200, max: 640, step: 4, unit: 'px' },
  { id: 'transRadius', label: 'Corner radius', dataType: 'number', section: 'Transparent sheet', min: 8, max: 48, step: 1, unit: 'px' },
  { id: 'transTransparency', label: 'Transparency', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transBlur', label: 'Backdrop blur', dataType: 'number', section: 'Transparent sheet', min: 0, max: 24, step: 1, unit: 'px' },
  { id: 'transSaturate', label: 'Saturation', dataType: 'number', section: 'Transparent sheet', min: 80, max: 220, step: 1, unit: '%' },
  { id: 'transBrightness', label: 'Brightness', dataType: 'number', section: 'Transparent sheet', min: 80, max: 140, step: 1, unit: '%' },
  { id: 'transBorder', label: 'Border opacity', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transFillTop', label: 'Top fill', dataType: 'number', section: 'Transparent sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'transFillMid', label: 'Mid fill', dataType: 'number', section: 'Transparent sheet', min: 0, max: 60, step: 1, unit: '%' },
  { id: 'transFillBottom', label: 'Bottom fill', dataType: 'number', section: 'Transparent sheet', min: 0, max: 60, step: 1, unit: '%' },
  { id: 'transShine', label: 'Top shine', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transDiagonalGloss', label: 'Diagonal gloss', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transShineOpacity', label: 'Shine opacity', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transDepth', label: 'Depth strength', dataType: 'number', section: 'Transparent sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'transInnerDepth', label: 'Inner depth', dataType: 'number', section: 'Transparent sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'transOuterShadow', label: 'Outer shadow', dataType: 'number', section: 'Transparent sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'transShadowSpread', label: 'Shadow spread', dataType: 'number', section: 'Transparent sheet', min: 8, max: 80, step: 1, unit: 'px' },
  { id: 'transGlow', label: 'Outer glow', dataType: 'number', section: 'Transparent sheet', min: 0, max: 80, step: 1, unit: '%' },

  { id: 'frostWidth', label: 'Width', dataType: 'number', section: 'Frost sheet', min: 200, max: 720, step: 4, unit: 'px' },
  { id: 'frostHeight', label: 'Height', dataType: 'number', section: 'Frost sheet', min: 160, max: 560, step: 4, unit: 'px' },
  { id: 'frostRadius', label: 'Corner radius', dataType: 'number', section: 'Frost sheet', min: 8, max: 48, step: 1, unit: 'px' },
  { id: 'frostOpacity', label: 'Fill opacity', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostBlur', label: 'Frost blur', dataType: 'number', section: 'Frost sheet', min: 0, max: 48, step: 1, unit: 'px' },
  { id: 'frostMatte', label: 'Frost matte', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostMatteTexture', label: 'Matte texture', dataType: 'number', section: 'Frost sheet', min: 80, max: 320, step: 4, unit: 'px' },
  { id: 'frostGloss', label: 'Frost gloss', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  ...(buildFrostSurfaceProfileFields('', 'Frost sheet') as SettingField[]),
  { id: 'frostSaturate', label: 'Saturation', dataType: 'number', section: 'Frost sheet', min: 80, max: 220, step: 1, unit: '%' },
  { id: 'frostBrightness', label: 'Brightness', dataType: 'number', section: 'Frost sheet', min: 80, max: 140, step: 1, unit: '%' },
  { id: 'frostBorder', label: 'Border opacity', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostFillLight', label: 'Light fill', dataType: 'number', section: 'Frost sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'frostFillDeep', label: 'Deep fill', dataType: 'number', section: 'Frost sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'frostShine', label: 'Top shine', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostDiagonalGloss', label: 'Diagonal gloss', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostShineOpacity', label: 'Shine opacity', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostDepth', label: 'Depth strength', dataType: 'number', section: 'Frost sheet', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frostInnerDepth', label: 'Inner depth', dataType: 'number', section: 'Frost sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'frostOuterShadow', label: 'Outer shadow', dataType: 'number', section: 'Frost sheet', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'frostShadowSpread', label: 'Shadow spread', dataType: 'number', section: 'Frost sheet', min: 8, max: 80, step: 1, unit: 'px' },
  { id: 'frostGlow', label: 'Outer glow', dataType: 'number', section: 'Frost sheet', min: 0, max: 80, step: 1, unit: '%' },
];

const palette: (keyof E2MaterialSettings)[] = ['colorCyan', 'colorBlue', 'colorDeep'];

const transShape: (keyof E2MaterialSettings)[] = ['transWidth', 'transHeight', 'transRadius'];
const frostShape: (keyof E2MaterialSettings)[] = ['frostWidth', 'frostHeight', 'frostRadius'];

const transMaterial: (keyof E2MaterialSettings)[] = [
  'transTransparency',
  'transBlur',
  'transSaturate',
  'transBrightness',
  'transBorder',
  'transFillTop',
  'transFillMid',
  'transFillBottom',
  'transShine',
  'transDiagonalGloss',
  'transShineOpacity',
  'transDepth',
  'transInnerDepth',
  'transOuterShadow',
  'transShadowSpread',
  'transGlow',
];

const frostMaterial: (keyof E2MaterialSettings)[] = [
  'frostOpacity',
  'frostBlur',
  'frostMatte',
  'frostMatteTexture',
  'frostGloss',
  'frostSaturate',
  'frostBrightness',
  'frostBorder',
  'frostFillLight',
  'frostFillDeep',
  'frostShine',
  'frostDiagonalGloss',
  'frostShineOpacity',
  'frostDepth',
  'frostInnerDepth',
  'frostOuterShadow',
  'frostShadowSpread',
  'frostGlow',
];

export const E2_INSPECT_CATALOG: Record<
  E2InspectTarget,
  { label: string; fields: (keyof E2MaterialSettings)[]; note?: string }
> = {
  'trans-sheet': {
    label: 'Transparent sheet',
    note: 'Super-transparent glass with border, fill, shine, and depth — no bezel rim or inner lip.',
    fields: [...transShape, ...transMaterial, ...palette],
  },
  'trans-shine': {
    label: 'Transparent shine layer',
    fields: ['transShine', 'transDiagonalGloss', 'transShineOpacity', ...palette],
  },
  'frost-sheet': {
    label: 'Frost sheet',
    note: 'More frosted glass with border, fill, shine, and depth — drag on top of the transparent sheet yourself.',
    fields: [...frostShape, ...frostMaterial, ...palette],
  },
  'frost-shine': {
    label: 'Frost shine layer',
    fields: ['frostShine', 'frostDiagonalGloss', 'frostShineOpacity', ...palette],
  },
};

export function isE2InspectTarget(value: string): value is E2InspectTarget {
  return value in E2_INSPECT_CATALOG;
}

export function e2InspectAttrs(target: E2InspectTarget, label?: string) {
  return {
    'data-e2-inspect': target,
    'data-e2-inspect-label': label ?? E2_INSPECT_CATALOG[target].label,
  };
}

const pct = (n: number) => n / 100;

export function e2SettingsToCssVars(s: E2MaterialSettings): CSSProperties {
  const transAlpha = 1 - s.transTransparency / 100;
  const frostAlpha = s.frostOpacity / 100;

  return {
    '--e2-cyan': s.colorCyan,
    '--e2-blue': s.colorBlue,
    '--e2-deep': s.colorDeep,
    '--e2-trans-width': `${s.transWidth}px`,
    '--e2-trans-height': `${s.transHeight}px`,
    '--e2-trans-radius': `${s.transRadius}px`,
    '--e2-trans-alpha': transAlpha,
    '--e2-trans-blur': `${s.transBlur}px`,
    '--e2-trans-saturate': `${s.transSaturate}%`,
    '--e2-trans-brightness': `${s.transBrightness}%`,
    '--e2-trans-border': pct(s.transBorder),
    '--e2-trans-fill-top': pct(s.transFillTop),
    '--e2-trans-fill-mid': pct(s.transFillMid),
    '--e2-trans-fill-bottom': pct(s.transFillBottom),
    '--e2-trans-shine': pct(s.transShine),
    '--e2-trans-diagonal': pct(s.transDiagonalGloss),
    '--e2-trans-shine-opacity': pct(s.transShineOpacity),
    '--e2-trans-depth': pct(s.transDepth),
    '--e2-trans-inner-depth': pct(s.transInnerDepth),
    '--e2-trans-outer-shadow': pct(s.transOuterShadow),
    '--e2-trans-shadow-spread': `${s.transShadowSpread}px`,
    '--e2-trans-glow': pct(s.transGlow),
    '--e2-frost-width': `${s.frostWidth}px`,
    '--e2-frost-height': `${s.frostHeight}px`,
    '--e2-frost-radius': `${s.frostRadius}px`,
    '--e2-frost-alpha': frostAlpha,
    '--e2-frost-blur': `${s.frostBlur}px`,
    ...frostSurfaceProfileCssVars(pickFrostSurfaceProfile(s as Record<string, unknown>, ''), '--e2'),
    '--e2-frost-saturate': `${s.frostSaturate}%`,
    '--e2-frost-brightness': `${s.frostBrightness}%`,
    '--e2-frost-border': pct(s.frostBorder),
    '--e2-frost-fill-light': pct(s.frostFillLight),
    '--e2-frost-fill-deep': pct(s.frostFillDeep),
    '--e2-frost-shine': pct(s.frostShine),
    '--e2-frost-diagonal': pct(s.frostDiagonalGloss),
    '--e2-frost-shine-opacity': pct(s.frostShineOpacity),
    '--e2-frost-depth': pct(s.frostDepth),
    '--e2-frost-inner-depth': pct(s.frostInnerDepth),
    '--e2-frost-outer-shadow': pct(s.frostOuterShadow),
    '--e2-frost-shadow-spread': `${s.frostShadowSpread}px`,
    '--e2-frost-glow': pct(s.frostGlow),
  } as CSSProperties;
}
