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
export const E4_BEZEL_SECTION = 'Layer A · Bezel layout';

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

const LAYER_A_SHEET_SECTIONS = E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer A', s));
const layerAShapeSectionIndex = LAYER_A_SHEET_SECTIONS.indexOf('Layer A · Shape');

export const E4_SECTION_ORDER = [
  'Palette',
  ...LAYER_A_SHEET_SECTIONS.slice(0, layerAShapeSectionIndex + 1),
  E4_BEZEL_SECTION,
  ...LAYER_A_SHEET_SECTIONS.slice(layerAShapeSectionIndex + 1),
  E4_CORNER_SECTION_A,
  E4_RADIAL_SECTION_A,
  ...E2_SHEET_SECTION_ORDER.map((s) => sheetSectionLabel('Layer B', s)),
  E4_CORNER_SECTION_B,
  E4_RADIAL_SECTION_B,
] as const;

export type E4RadialCornerId = 'Tl' | 'Tr' | 'Bl' | 'Br';

export type E4MaterialSettings = E3MaterialSettings & {
  layerAGlassReflexMode: E4CornerLayoutMode;
  layerAGlassReflexLight: number;
  layerAGlassReflexDark: number;
  layerAGlassReflexTlLight: number;
  layerAGlassReflexTlDark: number;
  layerAGlassReflexTrLight: number;
  layerAGlassReflexTrDark: number;
  layerAGlassReflexBlLight: number;
  layerAGlassReflexBlDark: number;
  layerAGlassReflexBrLight: number;
  layerAGlassReflexBrDark: number;
  layerAGlassReflexLightColor: string;
  layerAGlassReflexDarkColor: string;
  layerAGlassReflexRimPx: number;
  layerAGlassReflexMaskReach: number;
  layerAGlassReflexMaskFade: number;
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
  layerARadialGlowColor: string;
  layerARadialPeakOpacity: number;
  layerARadialMidOpacity: number;
  layerARadialMidStop: number;
  layerARadialFadeStop: number;
  layerARadialSecondaryPeak: number;
  layerARadialSecondaryMid: number;
  layerARadialSecondaryMidStop: number;
  layerARadialSecondaryFadeStop: number;
  layerBGlassReflexMode: E4CornerLayoutMode;
  layerBGlassReflexLight: number;
  layerBGlassReflexDark: number;
  layerBGlassReflexTlLight: number;
  layerBGlassReflexTlDark: number;
  layerBGlassReflexTrLight: number;
  layerBGlassReflexTrDark: number;
  layerBGlassReflexBlLight: number;
  layerBGlassReflexBlDark: number;
  layerBGlassReflexBrLight: number;
  layerBGlassReflexBrDark: number;
  layerBGlassReflexLightColor: string;
  layerBGlassReflexDarkColor: string;
  layerBGlassReflexRimPx: number;
  layerBGlassReflexMaskReach: number;
  layerBGlassReflexMaskFade: number;
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
  layerBRadialGlowColor: string;
  layerBRadialPeakOpacity: number;
  layerBRadialMidOpacity: number;
  layerBRadialMidStop: number;
  layerBRadialFadeStop: number;
  layerBRadialSecondaryPeak: number;
  layerBRadialSecondaryMid: number;
  layerBRadialSecondaryMidStop: number;
  layerBRadialSecondaryFadeStop: number;
  /** Horizontal inset of layer B within layer A (reference left-panel bezel). */
  layerABezelInsetX: number;
  /** Vertical inset of layer B within layer A. */
  layerABezelInsetY: number;
  /** Outer rim stroke thickness in px (layer A). */
  layerARimBorderPx: number;
  /** Gap from top before the vertical side highlight starts (layer A). */
  layerARimSideGapTop: number;
  /** Gap from bottom before the vertical side highlight ends (layer A). */
  layerARimSideGapBottom: number;
  /** Inner frost vertical side highlight inset from top (layer B). */
  layerBRimSideGapTop: number;
  /** Inner frost vertical side highlight inset from bottom (layer B). */
  layerBRimSideGapBottom: number;
  /** When true, layer B renders inside layer A and only A is draggable. */
  layerBNestedInA: boolean;
};

/** Fallback when Save 2 is not in localStorage yet. */
const SAVE2_FALLBACK_E3: E3MaterialSettings = buildInitialE3Settings();

/** Reference PNG left sidebar — tall narrow footprint (~3.45:1 aspect at 210px width). */
const REFERENCE_LEFT_PANEL_SIZES = {
  layerAWidth: 210,
  layerAHeight: 726,
  layerBWidth: 188,
  layerBHeight: 704,
} as const;

const E4_BEZEL_DEFAULTS = {
  layerABezelInsetX: 12,
  layerABezelInsetY: 12,
  layerARimBorderPx: 2,
  layerARimSideGapTop: 12,
  layerARimSideGapBottom: 12,
  layerBRimSideGapTop: 10,
  layerBRimSideGapBottom: 10,
  layerBNestedInA: false,
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

const GLASS_REFLEX_PER_CORNER_DEFAULTS = {
  TlLight: 1,
  TlDark: 1,
  TrLight: 0,
  TrDark: 0,
  BlLight: 0,
  BlDark: 0,
  BrLight: 1,
  BrDark: 1,
} as const;

function glassReflexAppearanceDefaults(prefix: 'layerA' | 'layerB') {
  return {
    [`${prefix}GlassReflexLightColor`]: '#ffffff',
    [`${prefix}GlassReflexDarkColor`]: '#000000',
    [`${prefix}GlassReflexRimPx`]: 1,
    [`${prefix}GlassReflexMaskReach`]: 44,
    [`${prefix}GlassReflexMaskFade`]: 74,
  } as Record<string, number | string>;
}

function radialAppearanceDefaults(prefix: 'layerA' | 'layerB') {
  return {
    [`${prefix}RadialGlowColor`]: '#ffffff',
    [`${prefix}RadialPeakOpacity`]: 88,
    [`${prefix}RadialMidOpacity`]: 28,
    [`${prefix}RadialMidStop`]: 36,
    [`${prefix}RadialFadeStop`]: 72,
    [`${prefix}RadialSecondaryPeak`]: 78,
    [`${prefix}RadialSecondaryMid`]: 22,
    [`${prefix}RadialSecondaryMidStop`]: 38,
    [`${prefix}RadialSecondaryFadeStop`]: 74,
  } as Record<string, number | string>;
}

function glassReflexDefaultsForLayer(prefix: 'layerA' | 'layerB') {
  return {
    [`${prefix}GlassReflexMode`]: 1,
    [`${prefix}GlassReflexLight`]: 1,
    [`${prefix}GlassReflexDark`]: 1,
    ...Object.fromEntries(
      (Object.entries(GLASS_REFLEX_PER_CORNER_DEFAULTS) as [string, number][]).map(([key, value]) => [
        `${prefix}GlassReflex${key}`,
        value,
      ]),
    ),
    ...glassReflexAppearanceDefaults(prefix),
  } as Record<string, number | string>;
}

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
    ...radialAppearanceDefaults(prefix),
  } as Record<string, number | string>;
}

const E4_CORNER_DEFAULTS = {
  ...glassReflexDefaultsForLayer('layerA'),
  ...glassReflexDefaultsForLayer('layerB'),
  ...radialDefaultsForLayer('layerA'),
  ...radialDefaultsForLayer('layerB'),
};

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
  return syncE4LayerBLayoutFromBezel({
    ...e3BaseToE4(resolveSave2E3()),
    ...REFERENCE_LEFT_PANEL_SIZES,
    ...E4_CORNER_DEFAULTS,
    ...E4_BEZEL_DEFAULTS,
  });
}

/** Keep layer B width/height concentric inside layer A bezel. */
export function syncE4LayerBDimensionsFromBezel(s: E4MaterialSettings): E4MaterialSettings {
  const insetX = s.layerABezelInsetX as number;
  const insetY = s.layerABezelInsetY as number;
  const outerW = s.layerAWidth as number;
  const outerH = s.layerAHeight as number;
  return {
    ...s,
    layerBWidth: outerW - insetX * 2,
    layerBHeight: outerH - insetY * 2,
  };
}

/** Match layer B corner radius to layer A minus horizontal inset. */
export function syncE4LayerBCornerRadiusFromBezel(s: E4MaterialSettings): E4MaterialSettings {
  const insetX = s.layerABezelInsetX as number;
  const outerR = s.layerACornerRadius as number;
  return {
    ...s,
    layerBCornerRadius: Math.max(4, outerR - insetX),
  };
}

/** Full bezel sync — used for defaults and reference preset application only. */
export function syncE4LayerBLayoutFromBezel(s: E4MaterialSettings): E4MaterialSettings {
  return syncE4LayerBCornerRadiusFromBezel(syncE4LayerBDimensionsFromBezel(s));
}

const LAYOUT_SYNC_RESIZE_B = new Set([
  'layerAWidth',
  'layerAHeight',
  'layerABezelInsetX',
  'layerABezelInsetY',
]);

/** Apply width/height/inset edits and keep layers A + B proportional. */
export function patchE4LayoutField(
  s: E4MaterialSettings,
  id: keyof E4MaterialSettings,
  value: E4MaterialSettings[keyof E4MaterialSettings],
): E4MaterialSettings {
  const next = { ...s, [id]: value } as E4MaterialSettings;

  if (id === 'layerACornerRadius') {
    return syncE4LayerBCornerRadiusFromBezel(next);
  }

  if (LAYOUT_SYNC_RESIZE_B.has(id)) {
    const synced = syncE4LayerBDimensionsFromBezel(next);
    return id === 'layerABezelInsetX' ? syncE4LayerBCornerRadiusFromBezel(synced) : synced;
  }

  if (id === 'layerBWidth' || id === 'layerBHeight') {
    const outerW = next.layerAWidth as number;
    const outerH = next.layerAHeight as number;
    const innerW = id === 'layerBWidth' ? (value as number) : (next.layerBWidth as number);
    const innerH = id === 'layerBHeight' ? (value as number) : (next.layerBHeight as number);
    const insetX = Math.max(4, Math.round((outerW - innerW) / 2));
    const insetY = Math.max(4, Math.round((outerH - innerH) / 2));
    return {
      ...next,
      layerBWidth: innerW,
      layerBHeight: innerH,
      layerABezelInsetX: insetX,
      layerABezelInsetY: insetY,
    };
  }

  return next;
}

export function e4LayerADimensionStyle(s: E4MaterialSettings): CSSProperties {
  const width = s.layerAWidth as number;
  const height = s.layerAHeight as number;
  return { width, height, minHeight: height };
}

export function e4LayerBDimensionStyle(s: E4MaterialSettings, nested: boolean): CSSProperties {
  if (nested) {
    return { width: '100%', height: '100%', minHeight: 0 };
  }
  const width = s.layerBWidth as number;
  const height = s.layerBHeight as number;
  return { width, height, minHeight: height };
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

function glassReflexMode(prefix: 'layerA' | 'layerB', settings: E4MaterialSettings): E4CornerLayoutMode {
  return settings[`${prefix}GlassReflexMode` as keyof E4MaterialSettings] as E4CornerLayoutMode;
}

function glassReflexPaired(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => {
    const mode = glassReflexMode(prefix, s);
    return mode === 1 || mode === 2;
  };
}

function glassReflexIndividual(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => glassReflexMode(prefix, s) === 3;
}

function glassReflexActive(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => glassReflexMode(prefix, s) !== 0;
}

function radialActive(prefix: 'layerA' | 'layerB') {
  return (s: E4MaterialSettings) => radialMode(prefix, s) !== 0;
}

function buildGlassReflexAppearanceFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return [
    {
      id: `${prefix}GlassReflexLightColor`,
      label: 'Highlight color',
      dataType: 'color',
      section,
      when: glassReflexActive(prefix),
      hint: 'Color mixed into PwzzovO inset highlights (--c-light). Default white catches overhead light on the glass lip.',
    },
    {
      id: `${prefix}GlassReflexDarkColor`,
      label: 'Shadow color',
      dataType: 'color',
      section,
      when: glassReflexActive(prefix),
      hint: 'Color mixed into inset shadow bands (--c-dark). Default black adds depth opposing the highlights.',
    },
    {
      id: `${prefix}GlassReflexRimPx`,
      label: 'Rim thickness',
      dataType: 'number',
      section,
      min: 0,
      max: 4,
      step: 0.25,
      unit: 'px',
      when: glassReflexActive(prefix),
      hint: 'Thickness of the inner rim stroke (first inset shadow). Default 1px — the hairline edge in the PwzzovO stack.',
    },
    {
      id: `${prefix}GlassReflexMaskReach`,
      label: 'Corner reach',
      dataType: 'number',
      section,
      min: 20,
      max: 70,
      step: 1,
      unit: '%',
      when: glassReflexActive(prefix),
      hint: 'How far the corner mask extends from the anchor before fading. Default 44% — controls reflex footprint size.',
    },
    {
      id: `${prefix}GlassReflexMaskFade`,
      label: 'Corner fade',
      dataType: 'number',
      section,
      min: 50,
      max: 95,
      step: 1,
      unit: '%',
      when: glassReflexActive(prefix),
      hint: 'Where the corner mask becomes fully transparent. Default 74% — higher = softer, wider falloff.',
    },
  ];
}

function buildRadialAppearanceFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return [
    {
      id: `${prefix}RadialGlowColor`,
      label: 'Glow color',
      dataType: 'color',
      section,
      when: radialActive(prefix),
      hint: 'Tint of the radial bloom. Default white, screen-blended over the glass.',
    },
    {
      id: `${prefix}RadialPeakOpacity`,
      label: 'Peak opacity',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Brightness at the gradient center for top/leading corners. Default 88%.',
    },
    {
      id: `${prefix}RadialMidOpacity`,
      label: 'Mid ring opacity',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Opacity at the mid stop of the bloom. Default 28%.',
    },
    {
      id: `${prefix}RadialMidStop`,
      label: 'Mid stop',
      dataType: 'number',
      section,
      min: 10,
      max: 60,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Gradient position of the mid ring. Default 36%.',
    },
    {
      id: `${prefix}RadialFadeStop`,
      label: 'Fade stop',
      dataType: 'number',
      section,
      min: 50,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Where the bloom becomes transparent for top/leading corners. Default 72%.',
    },
    {
      id: `${prefix}RadialSecondaryPeak`,
      label: 'Secondary peak',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Center brightness for bottom/trailing corners in a pair. Default 78%.',
    },
    {
      id: `${prefix}RadialSecondaryMid`,
      label: 'Secondary mid',
      dataType: 'number',
      section,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Mid-ring opacity for secondary corners. Default 22%.',
    },
    {
      id: `${prefix}RadialSecondaryMidStop`,
      label: 'Secondary mid stop',
      dataType: 'number',
      section,
      min: 10,
      max: 60,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Mid stop for secondary corners. Default 38%.',
    },
    {
      id: `${prefix}RadialSecondaryFadeStop`,
      label: 'Secondary fade',
      dataType: 'number',
      section,
      min: 50,
      max: 100,
      step: 1,
      unit: '%',
      when: radialActive(prefix),
      hint: 'Fade-out for secondary corners. Default 74%.',
    },
  ];
}

function buildPerCornerGlassReflexFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return RADIAL_CORNER_IDS.flatMap((corner) => {
    const idBase = `${prefix}GlassReflex${corner}`;
    return [
      {
        id: `${idBase}Light`,
        label: `${RADIAL_CORNER_LABELS[corner]} · reflex light`,
        dataType: 'number',
        section,
        min: 0,
        max: 2,
        step: 0.1,
        when: glassReflexIndividual(prefix),
        hint: `PwzzovO highlight multiplier at ${RADIAL_CORNER_LABELS[corner].toLowerCase()}. Scales white inset shadows; 0 turns this corner off.`,
      },
      {
        id: `${idBase}Dark`,
        label: `${RADIAL_CORNER_LABELS[corner]} · reflex dark`,
        dataType: 'number',
        section,
        min: 0,
        max: 2,
        step: 0.1,
        when: glassReflexIndividual(prefix),
        hint: `PwzzovO shadow multiplier at ${RADIAL_CORNER_LABELS[corner].toLowerCase()}. Deepens inset shade on that corner.`,
      },
    ] satisfies E4SettingField[];
  });
}

function buildGlassReflexFields(prefix: 'layerA' | 'layerB', section: string): E4SettingField[] {
  return [
    {
      id: `${prefix}GlassReflexMode`,
      label: 'Layout',
      dataType: 'select',
      section,
      options: E4_CORNER_LAYOUT_OPTIONS,
      hint: 'Which corners receive the PwzzovO inset shadow reflex. Off removes it; paired modes share settings; Each corner sets light/dark per corner.',
    },
    {
      id: `${prefix}GlassReflexLight`,
      label: 'Reflex light',
      dataType: 'number',
      section,
      min: 0,
      max: 2,
      step: 0.1,
      when: glassReflexPaired(prefix),
      hint: 'Multiplier on white inset highlights in the paired diagonal. 1 = PwzzovO default; 0 kills the lit side.',
    },
    {
      id: `${prefix}GlassReflexDark`,
      label: 'Reflex dark',
      dataType: 'number',
      section,
      min: 0,
      max: 2,
      step: 0.1,
      when: glassReflexPaired(prefix),
      hint: 'Multiplier on dark inset shadows in the paired diagonal. Adds opposing-corner depth.',
    },
    ...buildGlassReflexAppearanceFields(prefix, section),
    ...buildPerCornerGlassReflexFields(prefix, section),
  ];
}

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
        hint: `Bloom opacity at ${RADIAL_CORNER_LABELS[corner].toLowerCase()}. Multiplies the radial gradient; 0 hides this corner.`,
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
        hint: `Ellipse radius at ${RADIAL_CORNER_LABELS[corner].toLowerCase()} in px. Larger = softer spread from the corner.`,
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
      hint: 'Which corners get a soft radial bloom (separate from PwzzovO). Paired modes share size/strength; Each corner sets per-corner strength and size.',
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
      hint: 'Master opacity for both blooms in a diagonal pair. Applied as layer opacity over the gradient stack.',
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
      hint: 'Ellipse radius in px for both paired blooms. Default 88px.',
    },
    ...buildRadialAppearanceFields(prefix, section),
    ...buildPerCornerRadialFields(prefix, section),
  ];
}

const PALETTE_FIELDS: SettingField[] = [
  { id: 'colorCyan', label: 'Cyan accent', dataType: 'color', section: 'Palette' },
  { id: 'colorBlue', label: 'Blue', dataType: 'color', section: 'Palette' },
  { id: 'colorDeep', label: 'Deep blue', dataType: 'color', section: 'Palette' },
];

function buildE4SheetFields(prefix: 'layerA' | 'layerB', label: string): E4SettingField[] {
  return buildSheetFields(prefix, label).map((field) => {
    if (field.id === `${prefix}Height`) return { ...field, max: 920 };
    if (prefix === 'layerA' && field.id === `${prefix}Width`) return { ...field, max: 320 };
    return field;
  });
}

function buildBezelLayoutFields(): E4SettingField[] {
  return [
    {
      id: 'layerBNestedInA',
      label: 'Nest layer B inside A',
      dataType: 'boolean',
      section: E4_BEZEL_SECTION,
      hint: 'Off — drag layer A and B independently (default). On — single composite panel like the reference left nav.',
    },
    {
      id: 'layerABezelInsetX',
      label: 'Bezel inset (horizontal)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 4,
      max: 40,
      step: 1,
      unit: 'px',
      hint: 'How far layer B sits inside layer A on left and right — sets the visible outer bezel width.',
    },
    {
      id: 'layerABezelInsetY',
      label: 'Bezel inset (vertical)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 4,
      max: 40,
      step: 1,
      unit: 'px',
      hint: 'Top and bottom inset of layer B inside layer A — matches reference gap above/below the frost body.',
    },
    {
      id: 'layerARimBorderPx',
      label: 'Outer rim thickness',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 1,
      max: 4,
      step: 0.5,
      unit: 'px',
      hint: 'Stroke width of the outer bezel border. Reference left panel uses a 1px hairline.',
    },
    {
      id: 'layerARimSideGapTop',
      label: 'Side line gap (top)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      hint: 'Vertical side highlights start this far below the top — keeps lines from running into the corner curve.',
    },
    {
      id: 'layerARimSideGapBottom',
      label: 'Side line gap (bottom)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      hint: 'Vertical side highlights end this far above the bottom corner.',
    },
    {
      id: 'layerBRimSideGapTop',
      label: 'Inner side line gap (top)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      hint: 'Layer B frost body — vertical edge highlight inset from top.',
    },
    {
      id: 'layerBRimSideGapBottom',
      label: 'Inner side line gap (bottom)',
      dataType: 'number',
      section: E4_BEZEL_SECTION,
      min: 0,
      max: 80,
      step: 1,
      unit: 'px',
      hint: 'Layer B frost body — vertical edge highlight inset from bottom.',
    },
  ];
}

const BEZEL_LAYOUT_FIELDS = buildBezelLayoutFields();
const CORNER_FIELDS_A = buildGlassReflexFields('layerA', E4_CORNER_SECTION_A);
const RADIAL_FIELDS_A = buildRadialFields('layerA', E4_RADIAL_SECTION_A);
const CORNER_FIELDS_B = buildGlassReflexFields('layerB', E4_CORNER_SECTION_B);
const RADIAL_FIELDS_B = buildRadialFields('layerB', E4_RADIAL_SECTION_B);

export const E4_SETTING_FIELDS: E4SettingField[] = [
  ...PALETTE_FIELDS,
  ...buildE4SheetFields('layerA', 'Layer A'),
  ...BEZEL_LAYOUT_FIELDS,
  ...CORNER_FIELDS_A,
  ...RADIAL_FIELDS_A,
  ...buildE4SheetFields('layerB', 'Layer B'),
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

function glassReflexFieldIds(prefix: 'layerA' | 'layerB'): string[] {
  return [
    `${prefix}GlassReflexMode`,
    `${prefix}GlassReflexLight`,
    `${prefix}GlassReflexDark`,
    `${prefix}GlassReflexLightColor`,
    `${prefix}GlassReflexDarkColor`,
    `${prefix}GlassReflexRimPx`,
    `${prefix}GlassReflexMaskReach`,
    `${prefix}GlassReflexMaskFade`,
    ...RADIAL_CORNER_IDS.flatMap((corner) => [
      `${prefix}GlassReflex${corner}Light`,
      `${prefix}GlassReflex${corner}Dark`,
    ]),
  ];
}

function radialFieldIds(prefix: 'layerA' | 'layerB'): string[] {
  return [
    `${prefix}RadialCornerMode`,
    `${prefix}RadialCornerStrength`,
    `${prefix}RadialCornerSize`,
    `${prefix}RadialGlowColor`,
    `${prefix}RadialPeakOpacity`,
    `${prefix}RadialMidOpacity`,
    `${prefix}RadialMidStop`,
    `${prefix}RadialFadeStop`,
    `${prefix}RadialSecondaryPeak`,
    `${prefix}RadialSecondaryMid`,
    `${prefix}RadialSecondaryMidStop`,
    `${prefix}RadialSecondaryFadeStop`,
    ...RADIAL_CORNER_IDS.flatMap((corner) => [
      `${prefix}Radial${corner}Strength`,
      `${prefix}Radial${corner}Size`,
    ]),
  ];
}

const pwzzovFieldsA = glassReflexFieldIds('layerA');
const pwzzovFieldsB = glassReflexFieldIds('layerB');

const radialFieldsA = radialFieldIds('layerA');
const radialFieldsB = radialFieldIds('layerB');

export const E4_INSPECT_CATALOG: Record<
  E4InspectTarget,
  { label: string; fields: string[]; note?: string }
> = {
  'layer-a': {
    label: 'Layer A — bezel frame',
    note: 'Reference left-panel proportions — ultra-clear bezel with opposite-corner highlights.',
    fields: [
      ...layerInspectFields('layerA'),
      'layerBNestedInA',
      'layerABezelInsetX',
      'layerABezelInsetY',
      ...pwzzovFieldsA,
      ...radialFieldsA,
      ...palette,
    ],
  },
  'layer-a-rim': {
    label: 'Layer A — rim highlight',
    fields: [
      prefixed('layerA', 'borderWidth'),
      prefixed('layerA', 'borderOpacity'),
      prefixed('layerA', 'topRadial'),
      prefixed('layerA', 'depth'),
      'layerARimBorderPx',
      'layerARimSideGapTop',
      'layerARimSideGapBottom',
      'layerABezelInsetX',
      'layerABezelInsetY',
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
    note: 'Frosted inner sheet — nested inside layer A bezel with matching reference inset.',
    fields: [
      ...layerInspectFields('layerB'),
      'layerBNestedInA',
      'layerABezelInsetX',
      'layerABezelInsetY',
      ...pwzzovFieldsB,
      ...radialFieldsB,
      ...palette,
    ],
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
  const vars: Record<string, string | number> = {
    ...radialAppearanceVars(prefix, s),
  };

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

function glassReflexAppearanceVars(prefix: 'layerA' | 'layerB', s: E4MaterialSettings): Record<string, string | number> {
  const p = `--e4-${prefix}`;
  return {
    [`${p}-reflex-light-color`]: s[`${prefix}GlassReflexLightColor` as keyof E4MaterialSettings] as string,
    [`${p}-reflex-dark-color`]: s[`${prefix}GlassReflexDarkColor` as keyof E4MaterialSettings] as string,
    [`${p}-reflex-rim-px`]: `${s[`${prefix}GlassReflexRimPx` as keyof E4MaterialSettings] as number}px`,
    [`${p}-reflex-mask-reach`]: `${s[`${prefix}GlassReflexMaskReach` as keyof E4MaterialSettings] as number}%`,
    [`${p}-reflex-mask-fade`]: `${s[`${prefix}GlassReflexMaskFade` as keyof E4MaterialSettings] as number}%`,
  };
}

function radialAppearanceVars(prefix: 'layerA' | 'layerB', s: E4MaterialSettings): Record<string, string | number> {
  const p = `--e4-${prefix}`;
  return {
    [`${p}-radial-color`]: s[`${prefix}RadialGlowColor` as keyof E4MaterialSettings] as string,
    [`${p}-radial-peak`]: pct(s[`${prefix}RadialPeakOpacity` as keyof E4MaterialSettings] as number),
    [`${p}-radial-mid`]: pct(s[`${prefix}RadialMidOpacity` as keyof E4MaterialSettings] as number),
    [`${p}-radial-mid-stop`]: `${s[`${prefix}RadialMidStop` as keyof E4MaterialSettings] as number}%`,
    [`${p}-radial-fade-stop`]: `${s[`${prefix}RadialFadeStop` as keyof E4MaterialSettings] as number}%`,
    [`${p}-radial-sec-peak`]: pct(s[`${prefix}RadialSecondaryPeak` as keyof E4MaterialSettings] as number),
    [`${p}-radial-sec-mid`]: pct(s[`${prefix}RadialSecondaryMid` as keyof E4MaterialSettings] as number),
    [`${p}-radial-sec-mid-stop`]: `${s[`${prefix}RadialSecondaryMidStop` as keyof E4MaterialSettings] as number}%`,
    [`${p}-radial-sec-fade-stop`]: `${s[`${prefix}RadialSecondaryFadeStop` as keyof E4MaterialSettings] as number}%`,
  };
}

function glassReflexToCssVars(prefix: 'layerA' | 'layerB', s: E4MaterialSettings): Record<string, string | number> {
  const mode = glassReflexMode(prefix, s);
  const p = `--e4-${prefix}`;
  const vars: Record<string, string | number> = {
    ...glassReflexAppearanceVars(prefix, s),
  };

  for (const corner of RADIAL_CORNER_IDS) {
    const key = corner.toLowerCase();
    let light = 0;
    let dark = 0;
    let opacity = 0;

    if (mode === 1 && (corner === 'Tl' || corner === 'Br')) {
      light = s[`${prefix}GlassReflexLight` as keyof E4MaterialSettings] as number;
      dark = s[`${prefix}GlassReflexDark` as keyof E4MaterialSettings] as number;
      opacity = light > 0 || dark > 0 ? 1 : 0;
    } else if (mode === 2 && (corner === 'Tr' || corner === 'Bl')) {
      light = s[`${prefix}GlassReflexLight` as keyof E4MaterialSettings] as number;
      dark = s[`${prefix}GlassReflexDark` as keyof E4MaterialSettings] as number;
      opacity = light > 0 || dark > 0 ? 1 : 0;
    } else if (mode === 3) {
      light = s[`${prefix}GlassReflex${corner}Light` as keyof E4MaterialSettings] as number;
      dark = s[`${prefix}GlassReflex${corner}Dark` as keyof E4MaterialSettings] as number;
      opacity = light > 0 || dark > 0 ? 1 : 0;
    }

    vars[`${p}-reflex-${key}-light`] = light;
    vars[`${p}-reflex-${key}-dark`] = dark;
    vars[`${p}-reflex-${key}-opacity`] = opacity;
  }

  return vars;
}

function bezelToCssVars(s: E4MaterialSettings): Record<string, string | number> {
  return {
    '--e4-bezel-inset-x': `${s.layerABezelInsetX}px`,
    '--e4-bezel-inset-y': `${s.layerABezelInsetY}px`,
    '--e4-layerA-rim-border-px': `${s.layerARimBorderPx}px`,
    '--e4-layerA-rim-side-gap-top': `${s.layerARimSideGapTop}px`,
    '--e4-layerA-rim-side-gap-bottom': `${s.layerARimSideGapBottom}px`,
    '--e4-layerB-rim-side-gap-top': `${s.layerBRimSideGapTop}px`,
    '--e4-layerB-rim-side-gap-bottom': `${s.layerBRimSideGapBottom}px`,
  };
}

function cornerToCssVars(s: E4MaterialSettings): Record<string, string | number> {
  return {
    ...glassReflexToCssVars('layerA', s),
    ...glassReflexToCssVars('layerB', s),
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

  function migrateGlassReflexMode(prefix: 'layerA' | 'layerB'): E4CornerLayoutMode {
    const modeKey = `${prefix}GlassReflexMode`;
    if (typeof legacy[modeKey] === 'number') return legacy[modeKey] as E4CornerLayoutMode;
    if (legacy[`${prefix}OppositeCornerEnabled`] === false) return 0;
    return 1;
  }

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

  const layerAGlassMode = migrateGlassReflexMode('layerA');
  const layerBGlassMode = migrateGlassReflexMode('layerB');
  const layerAMode = migrateRadialMode('layerA');
  const layerBMode = migrateRadialMode('layerB');

  return {
    ...base,
    ...raw,
    layerAGlassReflexLight: raw.layerAGlassReflexLight ?? legacyLightA ?? base.layerAGlassReflexLight,
    layerAGlassReflexDark: raw.layerAGlassReflexDark ?? legacyLightA ?? base.layerAGlassReflexDark,
    layerBGlassReflexLight: raw.layerBGlassReflexLight ?? legacyLightB ?? base.layerBGlassReflexLight,
    layerBGlassReflexDark: raw.layerBGlassReflexDark ?? legacyLightB ?? base.layerBGlassReflexDark,
    layerAGlassReflexMode: layerAGlassMode,
    layerBGlassReflexMode: layerBGlassMode,
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
    ...bezelToCssVars(s),
    ...cornerToCssVars(s),
  } as CSSProperties;
}
