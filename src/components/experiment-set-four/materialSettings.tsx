/* Experiment 4 — E3 + opposite-corner highlights (CodePen PwzzovO) + reference left-panel sizing */

import type { CSSProperties } from 'react';
import type { MaterialFieldBase, MaterialSelectOption } from '../shared/MaterialSettingControl';
import {
  E2_SHEET_SECTION_ORDER,
  buildSheetFields,
  sheetPrefixedKey,
  sheetSectionLabel,
  type E2SheetMaterialKeys,
} from '../experiment-set-two/sheetMaterial';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { buildInitialE3Settings } from '../experiment-set-three/materialSettings';
import { loadExperimentSetOneSaves } from '../experiment-set-one/savedConfigs';

export const E4_CORNER_SECTION_A = 'Layer A · Corner glass';
export const E4_CORNER_SECTION_B = 'Layer B · Corner glass';
export const E4_RADIAL_SECTION_A = 'Layer A · Radial corners';
export const E4_RADIAL_SECTION_B = 'Layer B · Radial corners';

/** 0 off · 1 top-left + bottom-right · 2 top-right + bottom-left · 3 each corner */
export type E4RadialCornerMode = 0 | 1 | 2 | 3;

export const E4_RADIAL_MODE_OPTIONS: MaterialSelectOption[] = [
  { value: 0, label: 'Off' },
  { value: 1, label: 'Top left + bottom right' },
  { value: 2, label: 'Top right + bottom left' },
  { value: 3, label: 'Each corner' },
];

/** Shared layout options for glass reflex and radial corners */
export const E4_CORNER_LAYOUT_OPTIONS = E4_RADIAL_MODE_OPTIONS;
export type E4CornerLayoutMode = E4RadialCornerMode;

export const E4_SECTION_ORDER = [
  'Palette',
  ...E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer A', s)),
  E4_CORNER_SECTION_A,
  E4_RADIAL_SECTION_A,
  ...E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer B', s)),
  E4_CORNER_SECTION_B,
  E4_RADIAL_SECTION_B,
] as const;

export type E4RadialCornerId = 'Tl' | 'Tr' | 'Bl' | 'Br';

export type E4MaterialSettings = E3MaterialSettings & {
  layerAOppositeCornerEnabled: boolean;
  layerAGlassReflexLight: number;
  layerAGlassReflexDark: number;
  layerARadialCornerMode: E4RadialCornerMode;
  layerARadialCornerStrength: number;
  layerARadialCornerSize: number;
  layerARadialTlStrength: number;
  layerARadialTlSize: number;
  layerARadialTrStrength: number;
  layerARadialTrSize: number;
  layerARadialBlStrength: number;
  layerARadialBlSize: number;
  layerARadialBrStrength: number;
  layerARadialBrSize: number;
  layerBOppositeCornerEnabled: boolean;
  layerBGlassReflexLight: number;
  layerBGlassReflexDark: number;
  layerBRadialCornerMode: E4RadialCornerMode;
  layerBRadialCornerStrength: number;
  layerBRadialCornerSize: number;
  layerBRadialTlStrength: number;
  layerBRadialTlSize: number;
  layerBRadialTrStrength: number;
  layerBRadialTrSize: number;
  layerBRadialBlStrength: number;
  layerBRadialBlSize: number;
  layerBRadialBrStrength: number;
  layerBRadialBrSize: number;
};

/** Fallback when Save 2 is not in localStorage yet. */
const SAVE2_FALLBACK_E3: E3MaterialSettings = buildInitialE3Settings();

/** Reference PNG left sidebar — tall narrow footprint, equal layer heights, bezel inset. */
const REFERENCE_LEFT_PANEL_SIZES = {
  layerAWidth: 210,
  layerAHeight: 420,
  layerBWidth: 186,
  layerBHeight: 420,
} as const;

const RADIAL_PER_CORNER_DEFAULTS = {
  TlStrength: 70,
  TlSize: 88,
  TrStrength: 0,
  TrSize: 88,
  BlStrength: 0,
  BlSize: 88,
  BrStrength: 70,
  BrSize: 88,
} as const;

function radialDefaultsForLayer(prefix: 'layerA' | 'layerB') {
  return {
    [`${prefix}RadialCornerMode`]: 0,
    [`${prefix}RadialCornerStrength`]: 70,
    [`${prefix}RadialCornerSize`]: 88,
    ...Object.fromEntries(
      (Object.entries(RADIAL_PER_CORNER_DEFAULTS) as [string, number][]).map(([key, value]) => [
        `${prefix}Radial${key}`,
        value,
      ]),
    ),
  } as Record<string, number>;
}

const E4_CORNER_DEFAULTS = {
  layerAOppositeCornerEnabled: true,
  layerAGlassReflexLight: 1,
  layerAGlassReflexDark: 1,
  layerBOppositeCornerEnabled: true,
  layerBGlassReflexLight: 1,
  layerBGlassReflexDark: 1,
  ...radialDefaultsForLayer('layerA'),
  ...radialDefaultsForLayer('layerB'),
} as E4MaterialSettings;

function resolveSave2E3(): E3MaterialSettings {
  const save2 = loadExperimentSetOneSaves().find((save) => save.id === 2);
  return save2?.e3 ?? SAVE2_FALLBACK_E3;
}

function e3BaseToE4(e3: E3MaterialSettings): E4MaterialSettings {
  return {
    ...e3,
    ...E4_CORNER_DEFAULTS,
  } as E4MaterialSettings;
}

export function buildE4MasterDefaultSettings(): E4MaterialSettings {
  return {
    ...e3BaseToE4(resolveSave2E3()),
    ...REFERENCE_LEFT_PANEL_SIZES,
    ...E4_CORNER_DEFAULTS,
  };
}

export type E4InspectTarget =
  | 'layer-a'
  | 'layer-a-rim'
  | 'layer-a-corners'
  | 'layer-a-radial'
  | 'layer-b'
  | 'layer-b-shine'
  | 'layer-b-corners'
  | 'layer-b-radial';

type SettingField = MaterialFieldBase<string>;

export type E4SettingField = SettingField & {
  when?: (settings: E4MaterialSettings) => boolean;
};

const RADIAL_CORNER_IDS: E4RadialCornerId[] = ['Tl', 'Tr', 'Bl', 'Br'];

const RADIAL_CORNER_LABELS: Record<E4RadialCornerId, string> = {
  Tl: 'Top left',
  Tr: 'Top right',
  Bl: 'Bottom left',
  Br: 'Bottom right',
};

function radialMode(prefix: 'layerA' | 'layerB', settings: E4MaterialSettings): E4RadialCornerMode {
  return settings[`${prefix}RadialCornerMode` as keyof E4MaterialSettings] as E4RadialCornerMode;
}

function radialPaired(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => {
    const mode = radialMode(prefix, s);
    return mode === 1 || mode === 2;
  };
}

function radialIndividual(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => radialMode(prefix, s) === 3;
}

function buildPerCornerRadialFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return RADIAL_CORNER_IDS.flatMap((corner) => {
    const idBase = `${prefix}Radial${corner}`;
    return [
      {
        id: `${idBase}Strength`,
        label: `${RADIAL_CORNER_LABELS[corner]} · strength`,
        dataType: 'number',
        section,
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
        when: radialIndividual(prefix),
      },
      {
        id: `${idBase}Size`,
        label: `${RADIAL_CORNER_LABELS[corner]} · size`,
        dataType: 'number',
        section,
        min: 24,
        max: 200,
        step: 2,
        unit: 'px',
        when: radialIndividual(prefix),
      },
    ] satisfies E4SettingField[];
  });
}

function buildRadialFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return [
    {
      id: `${prefix}RadialCornerMode`,
      label: 'Layout',
      dataType: 'select',
      section,
      options: E4_RADIAL_MODE_OPTIONS,
    },
    {
      id: `${prefix}RadialCornerStrength`,
      label: 'Glow strength',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: radialPaired(prefix),
    },
    {
      id: `${prefix}RadialCornerSize`,
      label: 'Glow size',
      dataType: 'number',
      section,
      min: 24,
      max: 200,
      step: 2,
      unit: 'px',
      when: radialPaired(prefix),
    },
    ...buildPerCornerRadialFields(prefix, section),
  ];
}

const PALETTE_FIELDS: SettingField[] = [
  { id: 'colorCyan', label: 'Cyan accent', dataType: 'color', section: 'Palette' },
  { id: 'colorBlue', label: 'Blue', dataType: 'color', section: 'Palette' },
  { id: 'colorDeep', label: 'Deep blue', dataType: 'color', section: 'Palette' },
];

const CORNER_FIELDS_A: E4SettingField[] = [
  {
    id: 'layerAOppositeCornerEnabled',
    label: 'PwzzovO glass reflex',
    dataType: 'boolean',
    section: E4_CORNER_SECTION_A,
  },
  {
    id: 'layerAGlassReflexLight',
    label: 'Glass reflex light',
    dataType: 'number',
    section: E4_CORNER_SECTION_A,
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    id: 'layerAGlassReflexDark',
    label: 'Glass reflex dark',
    dataType: 'number',
    section: E4_CORNER_SECTION_A,
    min: 0,
    max: 2,
    step: 0.1,
  },
];

const RADIAL_FIELDS_A = buildRadialFields('layerA', E4_RADIAL_SECTION_A);

const CORNER_FIELDS_B: E4SettingField[] = [
  {
    id: 'layerBOppositeCornerEnabled',
    label: 'PwzzovO glass reflex',
    dataType: 'boolean',
    section: E4_CORNER_SECTION_B,
  },
  {
    id: 'layerBGlassReflexLight',
    label: 'Glass reflex light',
    dataType: 'number',
    section: E4_CORNER_SECTION_B,
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    id: 'layerBGlassReflexDark',
    label: 'Glass reflex dark',
    dataType: 'number',
    section: E4_CORNER_SECTION_B,
    min: 0,
    max: 2,
    step: 0.1,
  },
];

const RADIAL_FIELDS_B = buildRadialFields('layerB', E4_RADIAL_SECTION_B);

export const E4_SETTING_FIELDS: E4SettingField[] = [
  ...PALETTE_FIELDS,
  ...buildSheetFields('layerA', 'Layer A'),
  ...CORNER_FIELDS_A,
  ...RADIAL_FIELDS_A,
  ...buildSheetFields('layerB', 'Layer B'),
  ...CORNER_FIELDS_B,
  ...RADIAL_FIELDS_B,
];

export function e4FieldsVisibleForSettings(settings: E4MaterialSettings): E4SettingField[] {
  return E4_SETTING_FIELDS.filter((field) => !field.when || field.when(settings));
}

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

function radialFieldIds(prefix: 'layerA' | 'layerB'): string[] {
  return [
    `${prefix}RadialCornerMode`,
    `${prefix}RadialCornerStrength`,
    `${prefix}RadialCornerSize`,
    ...RADIAL_CORNER_IDS.flatMap((corner) => [
      `${prefix}Radial${corner}Strength`,
      `${prefix}Radial${corner}Size`,
    ]),
  ];
}

const pwzzovFieldsA = [
  'layerAOppositeCornerEnabled',
  'layerAGlassReflexLight',
  'layerAGlassReflexDark',
] as const;

const pwzzovFieldsB = [
  'layerBOppositeCornerEnabled',
  'layerBGlassReflexLight',
  'layerBGlassReflexDark',
] as const;

const radialFieldsA = radialFieldIds('layerA');
const radialFieldsB = radialFieldIds('layerB');

export const E4_INSPECT_CATALOG: Record<
  E4InspectTarget,
  { label: string; fields: string[]; note?: string }
> = {
  'layer-a': {
    label: 'Layer A — bezel frame',
    note: 'Reference left-panel proportions — ultra-clear bezel with opposite-corner highlights.',
    fields: [...layerInspectFields('layerA'), ...pwzzovFieldsA, ...radialFieldsA, ...palette],
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
  'layer-a-corners': {
    label: 'Layer A — PwzzovO reflex',
    note: 'Inset box-shadow stack from CodePen erichologist/PwzzovO (.switcher).',
    fields: [...pwzzovFieldsA, ...palette],
  },
  'layer-a-radial': {
    label: 'Layer A — radial corners',
    note: 'Soft screen-blended radial blooms — paired diagonals or per-corner control.',
    fields: [...radialFieldsA, ...palette],
  },
  'layer-b': {
    label: 'Layer B — frost body',
    note: 'Frosted inner sheet — same height as layer A, inset to match reference bezel.',
    fields: [...layerInspectFields('layerB'), ...pwzzovFieldsB, ...radialFieldsB, ...palette],
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
  'layer-b-corners': {
    label: 'Layer B — PwzzovO reflex',
    note: 'Inset box-shadow corner reflex on the frost body.',
    fields: [...pwzzovFieldsB, ...palette],
  },
  'layer-b-radial': {
    label: 'Layer B — radial corners',
    fields: [...radialFieldsB, ...palette],
  },
};

export function isE4InspectTarget(value: string): value is E4InspectTarget {
  return value in E4_INSPECT_CATALOG;
}

export function e4InspectAttrs(target: E4InspectTarget, label?: string) {
  return {
    'data-e4-inspect': target,
    'data-e4-inspect-label': label ?? E4_INSPECT_CATALOG[target].label,
  };
}

const pct = (n: number) => n / 100;

function extractLayer(s: E4MaterialSettings, prefix: 'layerA' | 'layerB'): E2SheetMaterialKeys {
  return {
    width: s[prefixed(prefix, 'width') as keyof E4MaterialSettings] as number,
    height: s[prefixed(prefix, 'height') as keyof E4MaterialSettings] as number,
    transparency: s[prefixed(prefix, 'transparency') as keyof E4MaterialSettings] as number,
    frost: s[prefixed(prefix, 'frost') as keyof E4MaterialSettings] as number,
    saturate: s[prefixed(prefix, 'saturate') as keyof E4MaterialSettings] as number,
    brightness: s[prefixed(prefix, 'brightness') as keyof E4MaterialSettings] as number,
    cornerRadius: s[prefixed(prefix, 'cornerRadius') as keyof E4MaterialSettings] as number,
    fillTop: s[prefixed(prefix, 'fillTop') as keyof E4MaterialSettings] as number,
    fillMid: s[prefixed(prefix, 'fillMid') as keyof E4MaterialSettings] as number,
    fillBottom: s[prefixed(prefix, 'fillBottom') as keyof E4MaterialSettings] as number,
    bodyTint: s[prefixed(prefix, 'bodyTint') as keyof E4MaterialSettings] as number,
    borderWidth: s[prefixed(prefix, 'borderWidth') as keyof E4MaterialSettings] as number,
    borderOpacity: s[prefixed(prefix, 'borderOpacity') as keyof E4MaterialSettings] as number,
    topShine: s[prefixed(prefix, 'topShine') as keyof E4MaterialSettings] as number,
    topRadial: s[prefixed(prefix, 'topRadial') as keyof E4MaterialSettings] as number,
    diagonalGloss: s[prefixed(prefix, 'diagonalGloss') as keyof E4MaterialSettings] as number,
    shineOpacity: s[prefixed(prefix, 'shineOpacity') as keyof E4MaterialSettings] as number,
    sparkle: s[prefixed(prefix, 'sparkle') as keyof E4MaterialSettings] as number,
    showSparkles: s[prefixed(prefix, 'showSparkles') as keyof E4MaterialSettings] as boolean,
    depth: s[prefixed(prefix, 'depth') as keyof E4MaterialSettings] as number,
    innerDepth: s[prefixed(prefix, 'innerDepth') as keyof E4MaterialSettings] as number,
    outerShadow: s[prefixed(prefix, 'outerShadow') as keyof E4MaterialSettings] as number,
    shadowSpread: s[prefixed(prefix, 'shadowSpread') as keyof E4MaterialSettings] as number,
    glow: s[prefixed(prefix, 'glow') as keyof E4MaterialSettings] as number,
    refraction: s[prefixed(prefix, 'refraction') as keyof E4MaterialSettings] as number,
  };
}

function layerToCssVars(prefix: 'layerA' | 'layerB', sheet: E2SheetMaterialKeys): Record<string, string | number> {
  const fillOpacity = 1 - sheet.transparency / 100;
  const p = `--e4-${prefix}`;
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

export function e4RadialLayoutAttr(mode: E4RadialCornerMode): 'off' | 'paired' | 'individual' {
  if (mode === 0) return 'off';
  if (mode === 3) return 'individual';
  return 'paired';
}

function radialCornerAlpha(
  s: E4MaterialSettings,
  prefix: 'layerA' | 'layerB',
  corner: E4RadialCornerId,
): number {
  const mode = radialMode(prefix, s);
  if (mode === 0) return 0;

  if (mode === 1 || mode === 2) {
    const strength = pct(s[`${prefix}RadialCornerStrength` as keyof E4MaterialSettings] as number);
    const pair: E4RadialCornerId[] = mode === 2 ? ['Tr', 'Bl'] : ['Tl', 'Br'];
    return pair.includes(corner) ? strength : 0;
  }

  return pct(s[`${prefix}Radial${corner}Strength` as keyof E4MaterialSettings] as number);
}

function radialCornerSize(
  s: E4MaterialSettings,
  prefix: 'layerA' | 'layerB',
  corner: E4RadialCornerId,
): string {
  const mode = radialMode(prefix, s);
  if (mode === 1 || mode === 2) {
    return `${s[`${prefix}RadialCornerSize` as keyof E4MaterialSettings] as number}px`;
  }
  return `${s[`${prefix}Radial${corner}Size` as keyof E4MaterialSettings] as number}px`;
}

function radialPairedPositions(mode: E4RadialCornerMode): { a: string; b: string } {
  if (mode === 2) return { a: '100% 0%', b: '0% 100%' };
  return { a: '0% 0%', b: '100% 100%' };
}

function radialToCssVars(prefix: 'layerA' | 'layerB', s: E4MaterialSettings): Record<string, string | number> {
  const mode = radialMode(prefix, s);
  const p = `--e4-${prefix}`;
  const vars: Record<string, string | number> = {};

  if (mode === 1 || mode === 2) {
    const positions = radialPairedPositions(mode);
    vars[`${p}-radial-paired-opacity`] = pct(s[`${prefix}RadialCornerStrength` as keyof E4MaterialSettings] as number);
    vars[`${p}-radial-size`] = `${s[`${prefix}RadialCornerSize` as keyof E4MaterialSettings] as number}px`;
    vars[`${p}-radial-pos-a`] = positions.a;
    vars[`${p}-radial-pos-b`] = positions.b;
  } else {
    vars[`${p}-radial-paired-opacity`] = 0;
    vars[`${p}-radial-size`] = '88px';
    vars[`${p}-radial-pos-a`] = '0% 0%';
    vars[`${p}-radial-pos-b`] = '100% 100%';
  }

  for (const corner of RADIAL_CORNER_IDS) {
    const key = corner.toLowerCase();
    vars[`${p}-radial-${key}-alpha`] = mode === 3 ? radialCornerAlpha(s, prefix, corner) : 0;
    vars[`${p}-radial-${key}-size`] = radialCornerSize(s, prefix, corner);
  }

  return vars;
}

function cornerToCssVars(s: E4MaterialSettings): Record<string, string | number> {
  return {
    '--e4-layerA-glass-reflex-light': s.layerAOppositeCornerEnabled ? s.layerAGlassReflexLight : 0,
    '--e4-layerA-glass-reflex-dark': s.layerAOppositeCornerEnabled ? s.layerAGlassReflexDark : 0,
    '--e4-layerB-glass-reflex-light': s.layerBOppositeCornerEnabled ? s.layerBGlassReflexLight : 0,
    '--e4-layerB-glass-reflex-dark': s.layerBOppositeCornerEnabled ? s.layerBGlassReflexDark : 0,
    ...radialToCssVars('layerA', s),
    ...radialToCssVars('layerB', s),
  };
}

/** Migrate legacy opposite-corner and radial fields from older session/save data. */
export function normalizeE4MaterialSettings(raw: Partial<E4MaterialSettings> | undefined): E4MaterialSettings {
  const base = buildE4MasterDefaultSettings();
  if (!raw) return base;

  const legacy = raw as Record<string, unknown>;
  const legacyLightA =
    typeof legacy.layerAOppositeCornerStrength === 'number' ? legacy.layerAOppositeCornerStrength / 100 : undefined;
  const legacyLightB =
    typeof legacy.layerBOppositeCornerStrength === 'number' ? legacy.layerBOppositeCornerStrength / 100 : undefined;

  function migrateRadialMode(prefix: 'layerA' | 'layerB'): E4RadialCornerMode {
    const modeKey = `${prefix}RadialCornerMode`;
    if (typeof legacy[modeKey] === 'number') return legacy[modeKey] as E4RadialCornerMode;
    if (!legacy[`${prefix}RadialCornerEnabled`]) return 0;
    if (legacy[`${prefix}RadialCornerPerCorner`]) return 3;
    const diagonal = legacy[`${prefix}RadialCornerDiagonal`];
    return typeof diagonal === 'number' && diagonal >= 1 ? 2 : 1;
  }

  function migrateCornerStrength(prefix: 'layerA' | 'layerB', corner: E4RadialCornerId): number | undefined {
    const strengthKey = `${prefix}Radial${corner}Strength`;
    if (typeof legacy[strengthKey] === 'number') {
      const onKey = `${prefix}Radial${corner}On`;
      if (legacy[onKey] === false) return 0;
      return legacy[strengthKey] as number;
    }
    return undefined;
  }

  const layerAMode = migrateRadialMode('layerA');
  const layerBMode = migrateRadialMode('layerB');

  return {
    ...base,
    ...raw,
    layerAGlassReflexLight: raw.layerAGlassReflexLight ?? legacyLightA ?? base.layerAGlassReflexLight,
    layerAGlassReflexDark: raw.layerAGlassReflexDark ?? legacyLightA ?? base.layerAGlassReflexDark,
    layerBGlassReflexLight: raw.layerBGlassReflexLight ?? legacyLightB ?? base.layerBGlassReflexLight,
    layerBGlassReflexDark: raw.layerBGlassReflexDark ?? legacyLightB ?? base.layerBGlassReflexDark,
    layerARadialCornerMode: layerAMode,
    layerBRadialCornerMode: layerBMode,
    layerARadialTlStrength: migrateCornerStrength('layerA', 'Tl') ?? raw.layerARadialTlStrength ?? base.layerARadialTlStrength,
    layerARadialTrStrength: migrateCornerStrength('layerA', 'Tr') ?? raw.layerARadialTrStrength ?? base.layerARadialTrStrength,
    layerARadialBlStrength: migrateCornerStrength('layerA', 'Bl') ?? raw.layerARadialBlStrength ?? base.layerARadialBlStrength,
    layerARadialBrStrength: migrateCornerStrength('layerA', 'Br') ?? raw.layerARadialBrStrength ?? base.layerARadialBrStrength,
    layerBRadialTlStrength: migrateCornerStrength('layerB', 'Tl') ?? raw.layerBRadialTlStrength ?? base.layerBRadialTlStrength,
    layerBRadialTrStrength: migrateCornerStrength('layerB', 'Tr') ?? raw.layerBRadialTrStrength ?? base.layerBRadialTrStrength,
    layerBRadialBlStrength: migrateCornerStrength('layerB', 'Bl') ?? raw.layerBRadialBlStrength ?? base.layerBRadialBlStrength,
    layerBRadialBrStrength: migrateCornerStrength('layerB', 'Br') ?? raw.layerBRadialBrStrength ?? base.layerBRadialBrStrength,
  } as E4MaterialSettings;
}

export function e4SettingsToCssVars(s: E4MaterialSettings): CSSProperties {
  return {
    '--e4-cyan': s.colorCyan,
    '--e4-blue': s.colorBlue,
    '--e4-deep': s.colorDeep,
    ...layerToCssVars('layerA', extractLayer(s, 'layerA')),
    ...layerToCssVars('layerB', extractLayer(s, 'layerB')),
    ...cornerToCssVars(s),
  } as CSSProperties;
}
