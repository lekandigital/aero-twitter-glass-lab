/**
 * Reference left-panel match for public/reference.png — proportions, bezel inset,
 * rim lines, and PwzzovO corner lighting/color. Not master defaults.
 *
 * Radial corners are intentionally excluded so your on/off choice is preserved.
 */

import type { E4MaterialSettings } from './materialSettings';
import { syncE4LayerBLayoutFromBezel } from './materialSettings';

/** Bump when reference left-panel match values change (one-time session migration). */
export const REFERENCE_CORNER_PRESET_VERSION = 4;

export const REFERENCE_CORNER_SAVE_ID = -1;

export const REFERENCE_CORNER_SAVE_LABEL = 'Jun 15 · ref corners';

export const REFERENCE_CORNER_SAVE_AT = '2026-06-15T12:00:00.000Z';

/**
 * Reference left nav shell — 210×726px (~3.45:1), 11px bezel inset, concentric radii.
 */
const REFERENCE_LEFT_PANEL_SHAPE_OVERRIDES = {
  layerAWidth: 210,
  layerAHeight: 726,
  layerABezelInsetX: 11,
  layerABezelInsetY: 11,
  layerARimBorderPx: 2,
  layerARimSideGapTop: 14,
  layerARimSideGapBottom: 14,
  layerBRimSideGapTop: 12,
  layerBRimSideGapBottom: 12,
  layerACornerRadius: 26,
  // Brighter outer frame: stronger top gloss + crisp perimeter rim to match the reference.
  layerABorderWidth: 58,
  layerABorderOpacity: 74,
  layerBCornerRadius: 15,
  layerBBorderWidth: 44,
  layerBBorderOpacity: 54,
  layerBWidth: 188,
  layerBHeight: 704,
} as const satisfies Partial<E4MaterialSettings>;

/**
 * PwzzovO glass reflex — per-corner asymmetry from reference (strong TL, soft TR, faint bottom).
 */
const REFERENCE_GLASS_REFLEX_OVERRIDES = {
  layerAGlassReflexMode: 3,
  layerAGlassReflexTlLight: 1.38,
  layerAGlassReflexTlDark: 0.38,
  layerAGlassReflexTrLight: 0.64,
  layerAGlassReflexTrDark: 0.42,
  layerAGlassReflexBlLight: 0.26,
  layerAGlassReflexBlDark: 0.56,
  layerAGlassReflexBrLight: 0.5,
  layerAGlassReflexBrDark: 0.64,
  layerAGlassReflexLightColor: '#F4FCFF',
  layerAGlassReflexDarkColor: '#123A5C',

  layerBGlassReflexMode: 3,
  layerBGlassReflexTlLight: 1.38,
  layerBGlassReflexTlDark: 0.38,
  layerBGlassReflexTrLight: 0.64,
  layerBGlassReflexTrDark: 0.42,
  layerBGlassReflexBlLight: 0.26,
  layerBGlassReflexBlDark: 0.56,
  layerBGlassReflexBrLight: 0.5,
  layerBGlassReflexBrDark: 0.64,
  layerBGlassReflexLightColor: '#F4FCFF',
  layerBGlassReflexDarkColor: '#123A5C',
} as const satisfies Partial<E4MaterialSettings>;

/**
 * Body, surface finish, refraction, and depth — clear glossy Aero glass that lets the
 * wallpaper read through while picking up a frosted tooth, gloss sheen, and soft float.
 */
const REFERENCE_GLASS_SURFACE_OVERRIDES = {
  // Layer A — outer frame: very clear, light frost, vivid refraction.
  layerATransparency: 94,
  layerAFrost: 3,
  layerASaturate: 130,
  layerABrightness: 108,
  layerAFillTop: 5,
  layerAFillMid: 2,
  layerAFillBottom: 3,
  layerABodyTint: 0,
  layerAFrostMatte: 10,
  layerAFrostMatteTexture: 150,
  layerAFrostGloss: 36,
  layerARefraction: 16,
  layerADepth: 42,
  layerAInnerDepth: 12,
  layerAOuterShadow: 34,
  layerAShadowSpread: 52,
  layerAGlow: 24,

  // Layer B — inner body: a touch more frost + gloss, still clearly see-through.
  layerBTransparency: 88,
  layerBFrost: 8,
  layerBSaturate: 138,
  layerBBrightness: 110,
  layerBFillTop: 12,
  layerBFillMid: 6,
  layerBFillBottom: 14,
  layerBBodyTint: 8,
  layerBFrostMatte: 14,
  layerBFrostMatteTexture: 150,
  layerBFrostGloss: 42,
  layerBRefraction: 18,
  layerBDepth: 70,
  layerBInnerDepth: 10,
  layerBOuterShadow: 28,
  layerBShadowSpread: 44,
  layerBGlow: 18,
  layerBTopShine: 70,
  layerBTopRadial: 54,
  layerBDiagonalGloss: 46,
  layerBShineOpacity: 86,
} as const satisfies Partial<E4MaterialSettings>;

/** Shape, bezel, rim lines, glass reflex, surface, refraction, depth — no radial corner changes. */
export const REFERENCE_CORNER_LIGHTING_OVERRIDES = {
  ...REFERENCE_LEFT_PANEL_SHAPE_OVERRIDES,
  ...REFERENCE_GLASS_REFLEX_OVERRIDES,
  ...REFERENCE_GLASS_SURFACE_OVERRIDES,
} as const satisfies Partial<E4MaterialSettings>;

export function applyReferenceCornerLighting(e4: E4MaterialSettings): E4MaterialSettings {
  return syncE4LayerBLayoutFromBezel({
    ...e4,
    ...REFERENCE_CORNER_LIGHTING_OVERRIDES,
  });
}
