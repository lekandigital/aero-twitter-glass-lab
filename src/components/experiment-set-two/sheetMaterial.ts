import type { MaterialFieldBase } from '../shared/MaterialSettingControl';
import { E1_DEFAULT_SETTINGS, type E1MaterialSettings } from '../experiment-one/materialSettings';

/** Experiment Two sheet material — mirrors Experiment One minus bezel (rim / inner bevel layers). */

export const E2_SHEET_SECTION_ORDER = [
  'Layout',
  'Background',
  'Shape',
  'Surface',
  'Border',
  'Reflection',
  'Depth',
  'Refraction',
] as const;

export type E2SheetSection = (typeof E2_SHEET_SECTION_ORDER)[number];

export type E2SheetMaterialKeys = {
  width: number;
  height: number;
  transparency: number;
  frost: number;
  saturate: number;
  brightness: number;
  cornerRadius: number;
  fillTop: number;
  fillMid: number;
  fillBottom: number;
  bodyTint: number;
  borderWidth: number;
  borderOpacity: number;
  topShine: number;
  topRadial: number;
  diagonalGloss: number;
  shineOpacity: number;
  sparkle: number;
  showSparkles: boolean;
  depth: number;
  innerDepth: number;
  outerShadow: number;
  shadowSpread: number;
  glow: number;
  refraction: number;
};

export type E2SheetPrefix = 'trans' | 'frost';

type PrefixedKey<P extends E2SheetPrefix, K extends keyof E2SheetMaterialKeys> = `${P}${Capitalize<K>}`;

export type E2PrefixedSheetKeys<P extends E2SheetPrefix> = {
  [K in keyof E2SheetMaterialKeys as PrefixedKey<P, K>]: E2SheetMaterialKeys[K];
};

type E2SheetFieldSpec = {
  key: keyof E2SheetMaterialKeys;
  label: string;
  section: E2SheetSection;
  dataType: 'number' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

const SHEET_FIELD_SPECS: E2SheetFieldSpec[] = [
  { key: 'width', label: 'Width', section: 'Layout', dataType: 'number', min: 200, max: 900, step: 4, unit: 'px' },
  { key: 'height', label: 'Height', section: 'Layout', dataType: 'number', min: 160, max: 640, step: 4, unit: 'px' },
  { key: 'transparency', label: 'Transparency', section: 'Background', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'frost', label: 'Frost blur', section: 'Background', dataType: 'number', min: 0, max: 40, step: 1, unit: 'px' },
  { key: 'saturate', label: 'Saturation', section: 'Background', dataType: 'number', min: 80, max: 220, step: 1, unit: '%' },
  { key: 'brightness', label: 'Brightness', section: 'Background', dataType: 'number', min: 80, max: 140, step: 1, unit: '%' },
  { key: 'cornerRadius', label: 'Corner radius', section: 'Shape', dataType: 'number', min: 8, max: 48, step: 1, unit: 'px' },
  { key: 'fillTop', label: 'Top fill', section: 'Surface', dataType: 'number', min: 0, max: 80, step: 1, unit: '%' },
  { key: 'fillMid', label: 'Mid fill', section: 'Surface', dataType: 'number', min: 0, max: 60, step: 1, unit: '%' },
  { key: 'fillBottom', label: 'Bottom fill', section: 'Surface', dataType: 'number', min: 0, max: 60, step: 1, unit: '%' },
  { key: 'bodyTint', label: 'Body cyan tint', section: 'Surface', dataType: 'number', min: 0, max: 30, step: 1, unit: '%' },
  { key: 'borderWidth', label: 'Rim strength', section: 'Border', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'borderOpacity', label: 'Border opacity', section: 'Border', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'topShine', label: 'Top radial shine', section: 'Reflection', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'topRadial', label: 'Top white radial', section: 'Reflection', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'diagonalGloss', label: 'Diagonal gloss', section: 'Reflection', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'shineOpacity', label: 'Shine layer opacity', section: 'Reflection', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'sparkle', label: 'Sparkle intensity', section: 'Reflection', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'showSparkles', label: 'Show sparkles', section: 'Reflection', dataType: 'boolean' },
  { key: 'depth', label: 'Depth strength', section: 'Depth', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'innerDepth', label: 'Inner bottom depth', section: 'Depth', dataType: 'number', min: 0, max: 80, step: 1, unit: '%' },
  { key: 'outerShadow', label: 'Outer shadow', section: 'Depth', dataType: 'number', min: 0, max: 80, step: 1, unit: '%' },
  { key: 'shadowSpread', label: 'Shadow spread', section: 'Depth', dataType: 'number', min: 8, max: 80, step: 1, unit: 'px' },
  { key: 'glow', label: 'Outer glow', section: 'Depth', dataType: 'number', min: 0, max: 80, step: 1, unit: '%' },
  { key: 'refraction', label: 'Edge refraction', section: 'Refraction', dataType: 'number', min: 0, max: 100, step: 1, unit: '%' },
];

function capitalize<K extends string>(key: K): Capitalize<K> {
  return (key.charAt(0).toUpperCase() + key.slice(1)) as Capitalize<K>;
}

export function e2PrefixedKey<P extends E2SheetPrefix>(prefix: P, key: keyof E2SheetMaterialKeys) {
  return `${prefix}${capitalize(key)}` as PrefixedKey<P, typeof key>;
}

export function sheetPrefixedKey(prefix: string, key: keyof E2SheetMaterialKeys) {
  return `${prefix}${capitalize(key)}`;
}

export function sheetSectionLabel(sheetLabel: string, section: E2SheetSection) {
  return `${sheetLabel} · ${section}`;
}

export function buildSheetFields(
  prefix: string,
  sheetLabel: string,
): MaterialFieldBase<string>[] {
  return SHEET_FIELD_SPECS.map((spec) => ({
    id: sheetPrefixedKey(prefix, spec.key),
    label: spec.label,
    dataType: spec.dataType,
    section: sheetSectionLabel(sheetLabel, spec.section),
    min: spec.min,
    max: spec.max,
    step: spec.step,
    unit: spec.unit,
  }));
}

export function prefixSheetMaterialGeneric(
  prefix: string,
  sheet: E2SheetMaterialKeys,
): Record<string, E2SheetMaterialKeys[keyof E2SheetMaterialKeys]> {
  const out: Record<string, E2SheetMaterialKeys[keyof E2SheetMaterialKeys]> = {};
  for (const key of Object.keys(sheet) as (keyof E2SheetMaterialKeys)[]) {
    out[sheetPrefixedKey(prefix, key)] = sheet[key];
  }
  return out;
}

function sheetFromE1(
  e1: E1MaterialSettings,
  layout: { width: number; height: number },
  overrides: Partial<E2SheetMaterialKeys> = {},
): E2SheetMaterialKeys {
  return {
    width: layout.width,
    height: layout.height,
    transparency: e1.transparency,
    frost: e1.frost,
    saturate: e1.saturate,
    brightness: e1.brightness,
    cornerRadius: e1.cornerRadius,
    fillTop: e1.fillTop,
    fillMid: e1.fillMid,
    fillBottom: e1.fillBottom,
    bodyTint: e1.bodyTint,
    borderWidth: e1.rim,
    borderOpacity: e1.rimBorder,
    topShine: e1.topShine,
    topRadial: e1.topRadial,
    diagonalGloss: e1.diagonalGloss,
    shineOpacity: e1.shineOpacity,
    sparkle: e1.sparkle,
    showSparkles: e1.showSparkles,
    depth: e1.depth,
    innerDepth: e1.innerDepth,
    outerShadow: e1.outerShadow,
    shadowSpread: e1.shadowSpread,
    glow: e1.glow,
    refraction: e1.refraction,
    ...overrides,
  };
}

export function e2SheetDefaultsFromE1(
  overrides: Partial<E2SheetMaterialKeys> = {},
): E2SheetMaterialKeys {
  return sheetFromE1(E1_DEFAULT_SETTINGS, { width: 680, height: 420 }, overrides);
}

export function prefixSheetMaterial<P extends E2SheetPrefix>(
  prefix: P,
  sheet: E2SheetMaterialKeys,
): E2PrefixedSheetKeys<P> {
  const out = {} as E2PrefixedSheetKeys<P>;
  for (const key of Object.keys(sheet) as (keyof E2SheetMaterialKeys)[]) {
    (out as Record<string, unknown>)[e2PrefixedKey(prefix, key)] = sheet[key];
  }
  return out;
}

export function e2SheetSectionLabel(sheetLabel: 'Transparent' | 'Frost', section: E2SheetSection) {
  return `${sheetLabel} · ${section}`;
}

export function buildE2SheetFields<P extends E2SheetPrefix>(
  prefix: P,
  sheetLabel: 'Transparent' | 'Frost',
): MaterialFieldBase<PrefixedKey<P, keyof E2SheetMaterialKeys>>[] {
  return buildSheetFields(prefix, sheetLabel) as MaterialFieldBase<PrefixedKey<P, keyof E2SheetMaterialKeys>>[];
}

export const E2_SECTION_ORDER = [
  'Palette',
  ...E2_SHEET_SECTION_ORDER.map((s) => e2SheetSectionLabel('Transparent', s)),
  ...E2_SHEET_SECTION_ORDER.map((s) => e2SheetSectionLabel('Frost', s)),
] as const;
