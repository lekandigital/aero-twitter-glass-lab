/* Experiment 3 — reference PNG layer study (Layer A bezel + Layer B frost body) */

import type { CSSProperties } from 'react';
import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import {
  E2_SHEET_SECTION_ORDER,
  buildSheetFields,
  prefixSheetMaterialGeneric,
  sheetPrefixedKey,
  sheetSectionLabel,
  type E2SheetMaterialKeys,
  type E2SheetSection,
} from '../experiment-set-two/sheetMaterial';

export const E3_SECTION_ORDER = [
  'Palette',
  ...E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer A', s)),
  ...E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer B', s)),
] as const;

export type E3MaterialSettings = {
  colorCyan: string;
  colorBlue: string;
  colorDeep: string;
  [key: `layerA${string}`]: number | boolean | string;
  [key: `layerB${string}`]: number | boolean | string;
};

const layerADefaults: E2SheetMaterialKeys = {
  width: 540,
  height: 400,
  transparency: 95,
  frost: 0,
  saturate: 112,
  brightness: 103,
  cornerRadius: 26,
  fillTop: 3,
  fillMid: 1,
  fillBottom: 1,
  bodyTint: 0,
  borderWidth: 90,
  borderOpacity: 68,
  topShine: 46,
  topRadial: 32,
  diagonalGloss: 36,
  shineOpacity: 62,
  sparkle: 25,
  showSparkles: false,
  depth: 38,
  innerDepth: 14,
  outerShadow: 32,
  shadowSpread: 48,
  glow: 22,
  refraction: 6,
};

const layerBDefaults: E2SheetMaterialKeys = {
  width: 492,
  height: 352,
  transparency: 40,
  frost: 20,
  saturate: 162,
  brightness: 110,
  cornerRadius: 20,
  fillTop: 58,
  fillMid: 42,
  fillBottom: 24,
  bodyTint: 14,
  borderWidth: 26,
  borderOpacity: 38,
  topShine: 68,
  topRadial: 52,
  diagonalGloss: 44,
  shineOpacity: 88,
  sparkle: 85,
  showSparkles: true,
  depth: 65,
  innerDepth: 28,
  outerShadow: 30,
  shadowSpread: 40,
  glow: 18,
  refraction: 14,
};

export const E3_DEFAULT_SETTINGS: E3MaterialSettings = {
  colorCyan: '#7ee8ff',
  colorBlue: '#2d8ee8',
  colorDeep: '#0a4a9a',
  ...prefixSheetMaterialGeneric('layerA', layerADefaults),
  ...prefixSheetMaterialGeneric('layerB', layerBDefaults),
} as E3MaterialSettings;

/** One-time bootstrap from exported config — size, transparency, and frost only (not master default). */
const E3_BOOTSTRAP_OVERRIDES: Partial<E3MaterialSettings> = {
  layerAWidth: 332,
  layerAHeight: 400,
  layerATransparency: 95,
  layerAFrost: 0,
  layerBWidth: 316,
  layerBHeight: 384,
  layerBTransparency: 54,
  layerBFrost: 1,
};

export function buildInitialE3Settings(): E3MaterialSettings {
  return { ...E3_DEFAULT_SETTINGS, ...E3_BOOTSTRAP_OVERRIDES } as E3MaterialSettings;
}

export type E3InspectTarget = 'layer-a' | 'layer-a-rim' | 'layer-b' | 'layer-b-shine';

type SettingField = MaterialFieldBase<string>;

const PALETTE_FIELDS: SettingField[] = [
  { id: 'colorCyan', label: 'Cyan accent', dataType: 'color', section: 'Palette' },
  { id: 'colorBlue', label: 'Blue', dataType: 'color', section: 'Palette' },
  { id: 'colorDeep', label: 'Deep blue', dataType: 'color', section: 'Palette' },
];

export const E3_SETTING_FIELDS: SettingField[] = [
  ...PALETTE_FIELDS,
  ...buildSheetFields('layerA', 'Layer A'),
  ...buildSheetFields('layerB', 'Layer B'),
];

const palette = ['colorCyan', 'colorBlue', 'colorDeep'] as const;

function prefixed(prefix: 'layerA' | 'layerB', key: keyof E2SheetMaterialKeys) {
  return sheetPrefixedKey(prefix, key);
}

function layerInspectFields(prefix: 'layerA' | 'layerB'): string[] {
  const keys: (keyof E2SheetMaterialKeys)[] = [
    'width',
    'height',
    'transparency',
    'frost',
    'saturate',
    'brightness',
    'cornerRadius',
    'fillTop',
    'fillMid',
    'fillBottom',
    'bodyTint',
    'borderWidth',
    'borderOpacity',
    'depth',
    'innerDepth',
    'outerShadow',
    'shadowSpread',
    'glow',
  ];
  return keys.map((key) => prefixed(prefix, key));
}

export const E3_INSPECT_CATALOG: Record<
  E3InspectTarget,
  { label: string; fields: string[]; note?: string }
> = {
  'layer-a': {
    label: 'Layer A — bezel frame',
    note: 'Ultra-transparent outer pane from the reference — clear glass rim with background showing through.',
    fields: [...layerInspectFields('layerA'), ...palette],
  },
  'layer-a-rim': {
    label: 'Layer A — rim highlight',
    fields: [
      prefixed('layerA', 'borderWidth'),
      prefixed('layerA', 'borderOpacity'),
      prefixed('layerA', 'topRadial'),
      prefixed('layerA', 'depth'),
      ...palette,
    ],
  },
  'layer-b': {
    label: 'Layer B — frost body',
    note: 'Milky frosted inner sheet from the reference — more opaque with heavier blur over the content area.',
    fields: [...layerInspectFields('layerB'), ...palette],
  },
  'layer-b-shine': {
    label: 'Layer B — shine layer',
    fields: [
      prefixed('layerB', 'topShine'),
      prefixed('layerB', 'topRadial'),
      prefixed('layerB', 'diagonalGloss'),
      prefixed('layerB', 'shineOpacity'),
      prefixed('layerB', 'sparkle'),
      prefixed('layerB', 'showSparkles'),
      ...palette,
    ],
  },
};

export function isE3InspectTarget(value: string): value is E3InspectTarget {
  return value in E3_INSPECT_CATALOG;
}

export function e3InspectAttrs(target: E3InspectTarget, label?: string) {
  return {
    'data-e3-inspect': target,
    'data-e3-inspect-label': label ?? E3_INSPECT_CATALOG[target].label,
  };
}

const pct = (n: number) => n / 100;

function extractLayer(s: E3MaterialSettings, prefix: 'layerA' | 'layerB'): E2SheetMaterialKeys {
  return {
    width: s[prefixed(prefix, 'width') as keyof E3MaterialSettings] as number,
    height: s[prefixed(prefix, 'height') as keyof E3MaterialSettings] as number,
    transparency: s[prefixed(prefix, 'transparency') as keyof E3MaterialSettings] as number,
    frost: s[prefixed(prefix, 'frost') as keyof E3MaterialSettings] as number,
    saturate: s[prefixed(prefix, 'saturate') as keyof E3MaterialSettings] as number,
    brightness: s[prefixed(prefix, 'brightness') as keyof E3MaterialSettings] as number,
    cornerRadius: s[prefixed(prefix, 'cornerRadius') as keyof E3MaterialSettings] as number,
    fillTop: s[prefixed(prefix, 'fillTop') as keyof E3MaterialSettings] as number,
    fillMid: s[prefixed(prefix, 'fillMid') as keyof E3MaterialSettings] as number,
    fillBottom: s[prefixed(prefix, 'fillBottom') as keyof E3MaterialSettings] as number,
    bodyTint: s[prefixed(prefix, 'bodyTint') as keyof E3MaterialSettings] as number,
    borderWidth: s[prefixed(prefix, 'borderWidth') as keyof E3MaterialSettings] as number,
    borderOpacity: s[prefixed(prefix, 'borderOpacity') as keyof E3MaterialSettings] as number,
    topShine: s[prefixed(prefix, 'topShine') as keyof E3MaterialSettings] as number,
    topRadial: s[prefixed(prefix, 'topRadial') as keyof E3MaterialSettings] as number,
    diagonalGloss: s[prefixed(prefix, 'diagonalGloss') as keyof E3MaterialSettings] as number,
    shineOpacity: s[prefixed(prefix, 'shineOpacity') as keyof E3MaterialSettings] as number,
    sparkle: s[prefixed(prefix, 'sparkle') as keyof E3MaterialSettings] as number,
    showSparkles: s[prefixed(prefix, 'showSparkles') as keyof E3MaterialSettings] as boolean,
    depth: s[prefixed(prefix, 'depth') as keyof E3MaterialSettings] as number,
    innerDepth: s[prefixed(prefix, 'innerDepth') as keyof E3MaterialSettings] as number,
    outerShadow: s[prefixed(prefix, 'outerShadow') as keyof E3MaterialSettings] as number,
    shadowSpread: s[prefixed(prefix, 'shadowSpread') as keyof E3MaterialSettings] as number,
    glow: s[prefixed(prefix, 'glow') as keyof E3MaterialSettings] as number,
    refraction: s[prefixed(prefix, 'refraction') as keyof E3MaterialSettings] as number,
  };
}

function layerToCssVars(prefix: 'layerA' | 'layerB', sheet: E2SheetMaterialKeys): Record<string, string | number> {
  const fillOpacity = 1 - sheet.transparency / 100;
  const p = `--e3-${prefix}`;
  return {
    [`${p}-width`]: `${sheet.width}px`,
    [`${p}-height`]: `${sheet.height}px`,
    [`${p}-radius`]: `${sheet.cornerRadius}px`,
    [`${p}-transparency`]: fillOpacity,
    [`${p}-frost`]: `${sheet.frost}px`,
    [`${p}-saturate`]: `${sheet.saturate}%`,
    [`${p}-brightness`]: `${sheet.brightness}%`,
    [`${p}-fill-top`]: pct(sheet.fillTop),
    [`${p}-fill-mid`]: pct(sheet.fillMid),
    [`${p}-fill-bottom`]: pct(sheet.fillBottom),
    [`${p}-body-tint`]: pct(sheet.bodyTint),
    [`${p}-rim-strength`]: pct(sheet.borderWidth),
    [`${p}-rim-border`]: pct(sheet.borderOpacity),
    [`${p}-top-shine`]: pct(sheet.topShine),
    [`${p}-top-radial`]: pct(sheet.topRadial),
    [`${p}-diagonal-gloss`]: pct(sheet.diagonalGloss),
    [`${p}-shine-opacity`]: pct(sheet.shineOpacity),
    [`${p}-depth-strength`]: pct(sheet.depth),
    [`${p}-inner-depth`]: pct(sheet.innerDepth),
    [`${p}-outer-shadow`]: pct(sheet.outerShadow),
    [`${p}-shadow-spread`]: `${sheet.shadowSpread}px`,
    [`${p}-glow`]: pct(sheet.glow),
    [`${p}-refraction`]: pct(sheet.refraction),
    [`${p}-sparkle`]: pct(sheet.sparkle),
  };
}

export function e3SettingsToCssVars(s: E3MaterialSettings): CSSProperties {
  return {
    '--e3-cyan': s.colorCyan,
    '--e3-blue': s.colorBlue,
    '--e3-deep': s.colorDeep,
    ...layerToCssVars('layerA', extractLayer(s, 'layerA')),
    ...layerToCssVars('layerB', extractLayer(s, 'layerB')),
  } as CSSProperties;
}

export type { E2SheetSection as E3SheetSection };
