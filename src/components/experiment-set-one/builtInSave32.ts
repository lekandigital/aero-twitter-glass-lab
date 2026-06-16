import type { ExperimentSetOneSnapshot } from './savedConfigs';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { builtInSave31 } from './builtInSave31';

export const SAVE_32_ID = 32;
export const SAVE_32_LABEL = 'Save 32';

/**
 * Save 32 — fully neutral version of Save 31.
 *
 * Save 31 still read faintly blue even over a black background, which means the
 * cast came from the panel's own tinted overlays rather than the wallpaper.
 * The shared CSS now neutralizes the intrinsic blues (bezel rings, base wash,
 * inner-depth shade, outer halo, drop shadows, refraction glint, sparkles).
 * This save neutralizes the remaining *per-save* colors that CSS can't reach:
 *
 *  - Radial corner glow `#E6F9FF` (light cyan) → neutral off-white.
 *  - Edge-reflex tints `#F4FCFF` / `#123A5C` (cyan / navy) → neutral.
 *
 * Everything else is inherited from Save 31 (geometry, gloss, depth, frost,
 * refraction, eased saturation) and the palette swatches are left untouched.
 * Visible in Experiment Four and Five.
 */
export function builtInSave32(): ExperimentSetOneSnapshot {
  const base = builtInSave31();
  return {
    ...base,
    id: SAVE_32_ID,
    label: SAVE_32_LABEL,
    savedAt: '2026-06-16T22:55:00.000Z',
    e4: {
      ...(base.e4 ?? {}),

      // Neutralize Layer A radial corner glow + edge-reflex tints.
      layerARadialGlowColor: '#F1F3F4',
      layerAGlassReflexLightColor: '#F6F7F8',
      layerAGlassReflexDarkColor: '#2E3238',

      // Neutralize Layer B radial corner glow + edge-reflex tints.
      layerBRadialGlowColor: '#F1F3F4',
      layerBGlassReflexLightColor: '#F6F7F8',
      layerBGlassReflexDarkColor: '#2E3238',

      // Saturation back to ~natural: the blue was coming from the overlays (now
      // neutral), so we no longer need to desaturate — which was leaving an
      // overall grey cast over the wallpaper.
      layerASaturate: 100,
      layerBSaturate: 104,

      // Bottom corners read too grey: the dark edge-reflex there was very
      // strong (Layer B br was 1.3). Pull bl/br darks right down so the lower
      // corners stay clean, and lighten the inner-depth band a touch.
      layerAGlassReflexBlDark: 0.2,
      layerAGlassReflexBrDark: 0.22,
      layerBGlassReflexBlDark: 0.24,
      layerBGlassReflexBrDark: 0.28,
      layerAInnerDepth: 16,
      layerBInnerDepth: 18,
    } as Partial<E4MaterialSettings>,
    scope: 'four',
  };
}
