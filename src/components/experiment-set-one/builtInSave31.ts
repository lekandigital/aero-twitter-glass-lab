import type { ExperimentSetOneSnapshot } from './savedConfigs';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { builtInSave29 } from './builtInSave29';

export const SAVE_31_ID = 31;
export const SAVE_31_LABEL = 'Save 31';

/**
 * Save 31 — reference left-panel "wet glass" interior preset.
 *
 * Builds on Save 29's approved bezel/border, then retunes the *interior*
 * material to read like the reference image's left panel:
 *
 *  - Background: brighter cool-white crown, airy powder-blue midriff, and a
 *    clearer cool base so the grass shows through (lower fill-bottom + a touch
 *    more transparency on Layer B). Pairs with the new sky-bounce gradients.
 *  - Surface: enables a top-biased wet gloss (+ a whisper of matte tooth) via
 *    the per-layer frost-surface profile so the sheet looks oily/wet, not flat.
 *  - Reflection: broader, softer top bloom + gentler diagonal streak.
 *  - Depth: slightly lighter inner shade (keeps the body clear) with a touch
 *    more cyan halo.
 *  - Refraction: bumps both layers so the new SVG edge-glint shimmer reads.
 *  - Palette: unchanged (cyan/blue/deep kept exactly as Save 29).
 *
 * Visible in Experiment Four and Five.
 */
export function builtInSave31(): ExperimentSetOneSnapshot {
  const base = builtInSave29();
  return {
    ...base,
    id: SAVE_31_ID,
    label: SAVE_31_LABEL,
    savedAt: '2026-06-16T22:35:00.000Z',
    e4: {
      ...(base.e4 ?? {}),

      // ── Layer A (clear bezel frame) ──────────────────────────────────────
      // Background: keep the frame clear, just a touch cooler/brighter.
      layerABrightness: 104,
      layerAFillTop: 4,
      layerAFillMid: 2,
      layerAFillBottom: 2,
      layerABodyTint: 3,
      // Surface: faint top wet sheen on the frame.
      layerAFrostMatte: 4,
      layerAFrostMatteTexture: 150,
      layerAFrostGloss: 14,
      layerAFrostSurfaceRegion: 1,
      layerAFrostSurfacePeak: 0,
      layerAFrostSurfaceSpread: 30,
      layerAFrostSurfaceFadeEnd: 50,
      layerAFrostSurfaceSoftness: 82,
      layerAFrostSurfaceDirection: 0,
      // Reflection: broader soft top bloom.
      layerATopShine: 72,
      layerATopRadial: 56,
      layerADiagonalGloss: 40,
      layerAShineOpacity: 78,
      // Depth: lighter inner shade (frame stays clear) + a bit more halo.
      layerADepth: 60,
      layerAInnerDepth: 20,
      layerAOuterShadow: 42,
      layerAShadowSpread: 60,
      layerAGlow: 38,
      // Refraction: edge shimmer just readable on the clear frame.
      layerARefraction: 14,

      // ── Layer B (frosted inner sheet / body) ─────────────────────────────
      // Background: bright milky crown, clearer cool base so grass reads.
      layerBTransparency: 78,
      layerBFrost: 36,
      layerBSaturate: 150,
      layerBBrightness: 132,
      layerBFillTop: 70,
      layerBFillMid: 16,
      layerBFillBottom: 44,
      layerBBodyTint: 16,
      // Surface: stronger top-biased wet gloss + light matte tooth.
      layerBFrostMatte: 6,
      layerBFrostMatteTexture: 150,
      layerBFrostGloss: 30,
      layerBFrostSurfaceRegion: 1,
      layerBFrostSurfacePeak: 0,
      layerBFrostSurfaceSpread: 34,
      layerBFrostSurfaceFadeEnd: 50,
      layerBFrostSurfaceSoftness: 82,
      layerBFrostSurfaceDirection: 0,
      // Reflection: broad wet bloom + softer streak.
      layerBTopShine: 78,
      layerBTopRadial: 64,
      layerBDiagonalGloss: 40,
      layerBShineOpacity: 88,
      // Depth: keep body clear-ish, lift the halo.
      layerBDepth: 72,
      layerBInnerDepth: 24,
      layerBOuterShadow: 40,
      layerBShadowSpread: 52,
      layerBGlow: 34,
      // Refraction: a touch more edge shimmer on the body.
      layerBRefraction: 20,
    } as Partial<E4MaterialSettings>,
    scope: 'four',
  };
}
