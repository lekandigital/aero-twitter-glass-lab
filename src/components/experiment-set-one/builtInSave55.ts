import type { ExperimentSetOneSnapshot } from './savedConfigs';
import { builtInSave54 } from './builtInSave54';

export const SAVE_55_ID = 55;
export const SAVE_55_LABEL = 'Save 55';

/**
 * Save 55 — reference left-panel body pass (from Save 54).
 *
 * Tunes Background, Surface, Reflection, Depth, and Refraction for both layers
 * while keeping Save 54's border/bezel/corner work and the existing palette.
 */
export function builtInSave55(): ExperimentSetOneSnapshot {
  const base = builtInSave54();
  return {
    ...base,
    id: SAVE_55_ID,
    label: SAVE_55_LABEL,
    savedAt: '2026-06-17T00:15:00.000Z',
    e4: {
      ...base.e4,
      // Layer A — ultra-clear bezel frame
      layerATransparency: 94,
      layerAFrost: 2,
      layerAFrostMatte: 0,
      layerAFrostGloss: 0,
      layerAFrostSurfaceRegion: 0,
      layerASaturate: 110,
      layerABrightness: 104,
      layerAFillTop: 4,
      layerAFillMid: 1,
      layerAFillBottom: 1,
      layerABodyTint: 0,
      layerATopShine: 54,
      layerATopRadial: 38,
      layerADiagonalGloss: 36,
      layerAShineOpacity: 78,
      layerASparkle: 22,
      layerADepth: 38,
      layerAInnerDepth: 10,
      layerAOuterShadow: 44,
      layerAShadowSpread: 54,
      layerAGlow: 32,
      layerARefraction: 16,
      layerARadialTlStrength: 68,
      layerARadialTlSize: 96,
      layerARadialTrStrength: 44,
      layerARadialTrSize: 84,
      // Layer B — clear frosted body with soft top sheen
      layerBTransparency: 88,
      layerBFrost: 18,
      layerBFrostMatte: 8,
      layerBFrostMatteTexture: 180,
      layerBFrostGloss: 16,
      layerBFrostSurfaceRegion: 1,
      layerBFrostSurfacePeak: 10,
      layerBFrostSurfaceSpread: 18,
      layerBFrostSurfaceFadeEnd: 42,
      layerBFrostSurfaceSoftness: 72,
      layerBFrostSurfaceDirection: 0,
      layerBSaturate: 132,
      layerBBrightness: 108,
      layerBFillTop: 10,
      layerBFillMid: 5,
      layerBFillBottom: 14,
      layerBBodyTint: 4,
      layerBTopShine: 44,
      layerBTopRadial: 24,
      layerBDiagonalGloss: 26,
      layerBShineOpacity: 76,
      layerBSparkle: 62,
      layerBShowSparkles: true,
      layerBDepth: 64,
      layerBInnerDepth: 14,
      layerBOuterShadow: 36,
      layerBShadowSpread: 46,
      layerBGlow: 24,
      layerBRefraction: 22,
      layerBRadialCornerStrength: 48,
      layerBRadialCornerSize: 88,
      layerBRadialTlStrength: 72,
      layerBRadialTlSize: 108,
      layerBRadialTrStrength: 40,
      layerBRadialTrSize: 68,
    },
  };
}
