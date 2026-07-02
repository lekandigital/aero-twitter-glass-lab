import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { EXPERIMENT_SIX_PANEL_SNAP } from './experimentSixPanelGeometry';

/** Experiment Seven — compact nested panel (326×38 outer, 321×35.3 inner, B centered in A). */
export const EXPERIMENT_SEVEN_PANEL_LAYOUT = {
  layerAWidth: 326,
  layerAHeight: 38,
  layerACornerRadius: 28,
  layerABezelInsetX: 8,
  layerABezelInsetY: 6,
  layerBWidth: 321,
  layerBHeight: 35.3,
  layerBCornerRadius: 20,
} as const;

export const EXPERIMENT_SEVEN_PANEL_SNAP = EXPERIMENT_SIX_PANEL_SNAP;

/** Layer B vertical L/R side frost off — E7 uses top/bottom hairlines only. */
export const E7_ZERO_LAYER_B_SIDE_FROST = {
  layerBBorderLeftStrength: 0,
  layerBBorderLeftOpacity: 0,
  layerBBorderRightStrength: 0,
  layerBBorderRightOpacity: 0,
  layerBGlassReflexLeftLight: 0,
  layerBGlassReflexLeftDark: 0,
  layerBGlassReflexLeftSpread: 0,
  layerBGlassReflexRightLight: 0,
  layerBGlassReflexRightDark: 0,
  layerBGlassReflexRightSpread: 0,
  layerBRimSideShadowStrength: 0,
  layerBRimSideShadowBlurPx: 0,
  /** Collapse vertical rim-side bars on the ~35px-tall pill. */
  layerBRimSideGapTop: 18,
  layerBRimSideGapBottom: 18,
  layerABorderLeftStrength: 0,
  layerABorderLeftOpacity: 0,
  layerABorderRightStrength: 0,
  layerABorderRightOpacity: 0,
  layerAGlassReflexLeftLight: 0,
  layerAGlassReflexLeftDark: 0,
  layerAGlassReflexLeftSpread: 0,
  layerAGlassReflexRightLight: 0,
  layerAGlassReflexRightDark: 0,
  layerAGlassReflexRightSpread: 0,
} as const satisfies Partial<E4MaterialSettings>;

/** Layout, bezel, and rim fields shared across all E7 branch saves. */
export const E7_SHARED_PANEL_FIELD_KEYS: (keyof E4MaterialSettings)[] = [
  'layerAWidth',
  'layerAHeight',
  'layerACornerRadius',
  'layerBWidth',
  'layerBHeight',
  'layerBCornerRadius',
  'layerBNestedInA',
  'layerABezelInsetX',
  'layerABezelInsetY',
  'layerARimBorderPx',
  'layerARimSideGapTop',
  'layerARimSideGapBottom',
  'layerARimSideWidthPx',
  'layerARimSideShadowStrength',
  'layerARimSideShadowBlurPx',
  'layerBRimEdgeHeightPx',
  'layerBRimSideWidthPx',
  'layerABorderEdgeMode',
  'layerABorderTopStrength',
  'layerABorderTopOpacity',
  'layerABorderBottomStrength',
  'layerABorderBottomOpacity',
  'layerBBorderEdgeMode',
  'layerBBorderTopStrength',
  'layerBBorderTopOpacity',
  'layerBBorderBottomStrength',
  'layerBBorderBottomOpacity',
];

export function mergeExperimentSevenSharedPanelFields(
  branch: E4MaterialSettings,
  shared: E4MaterialSettings,
): E4MaterialSettings {
  const overrides = Object.fromEntries(
    E7_SHARED_PANEL_FIELD_KEYS.map((key) => [key, shared[key]]),
  ) as Partial<E4MaterialSettings>;
  return { ...branch, ...overrides } as E4MaterialSettings;
}

/** Body / rim fields copied from layer A so B matches the glitch-shell look at inner size. */
const E7_GLITCH_SHELL_B_FROM_A_SUFFIXES = [
  'Transparency',
  'Frost',
  'FrostMatte',
  'FrostGloss',
  'FrostSurfaceRegion',
  'FrostSurfacePeak',
  'FrostSurfaceSpread',
  'FrostSurfaceFadeEnd',
  'FrostSurfaceSoftness',
  'Saturate',
  'Brightness',
  'FillTop',
  'FillMid',
  'FillBottom',
  'BodyTint',
  'BorderWidth',
  'BorderOpacity',
  'TopShine',
  'TopRadial',
  'Refraction',
  'Depth',
  'InnerDepth',
  'OuterShadow',
  'ShadowSpread',
  'Glow',
  'ShineOpacity',
  'DiagonalGloss',
  'Sparkle',
] as const;

export function applyE7GlitchShellBFromA(s: E4MaterialSettings): E4MaterialSettings {
  const out = { ...s };
  for (const suffix of E7_GLITCH_SHELL_B_FROM_A_SUFFIXES) {
    const aKey = `layerA${suffix}` as keyof E4MaterialSettings;
    const bKey = `layerB${suffix}` as keyof E4MaterialSettings;
    (out as Record<string, unknown>)[bKey] = s[aKey];
  }
  return out;
}

export function applyExperimentSevenPanelGeometry(s: E4MaterialSettings): E4MaterialSettings {
  const bHairlines = {
    layerBBorderTopStrength: 0,
    layerBBorderTopOpacity: 0,
    layerBBorderBottomStrength: 0,
    layerBBorderBottomOpacity: 0,
    layerBRimEdgeHeightPx: 0,
  };
  const withLayout = {
    ...s,
    layerAWidth: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerAWidth,
    layerAHeight: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerAHeight,
    layerACornerRadius: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerACornerRadius,
    layerABezelInsetX: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerABezelInsetX,
    layerABezelInsetY: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerABezelInsetY,
    layerBWidth: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerBWidth,
    layerBHeight: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerBHeight,
    layerBCornerRadius: EXPERIMENT_SEVEN_PANEL_LAYOUT.layerBCornerRadius,
    layerBNestedInA: true,
    ...E7_ZERO_LAYER_B_SIDE_FROST,
  };
  return {
    ...applyE7GlitchShellBFromA(withLayout),
    ...E7_ZERO_LAYER_B_SIDE_FROST,
    ...bHairlines,
  };
}
