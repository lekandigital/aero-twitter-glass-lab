/**
 * One-time nudge toward public/reference.png left-panel borders, corners, and edge lighting.
 * Applied to the live Experiment Five session only — never mutates saved presets.
 */

import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { syncE4LayerBLayoutFromBezel } from '../experiment-set-four/materialSettings';

export const E5_BORDER_REFINEMENTS_VERSION = 1;

function nudge(current: number, target: number, amount = 0.42): number {
  const next = current + (target - current) * amount;
  return Number.isInteger(target) && Number.isInteger(current) ? Math.round(next) : Math.round(next * 100) / 100;
}

function nudgeLayerSheet(
  s: E4MaterialSettings,
  prefix: 'layerA' | 'layerB',
  targets: {
    cornerRadius: number;
    borderWidth: number;
    borderOpacity: number;
    topShine: number;
    topRadial: number;
    shineOpacity: number;
    diagonalGloss: number;
  },
): E4MaterialSettings {
  return {
    ...s,
    [`${prefix}CornerRadius`]: nudge(s[`${prefix}CornerRadius` as keyof E4MaterialSettings] as number, targets.cornerRadius),
    [`${prefix}BorderWidth`]: nudge(s[`${prefix}BorderWidth` as keyof E4MaterialSettings] as number, targets.borderWidth),
    [`${prefix}BorderOpacity`]: nudge(s[`${prefix}BorderOpacity` as keyof E4MaterialSettings] as number, targets.borderOpacity),
    [`${prefix}TopShine`]: nudge(s[`${prefix}TopShine` as keyof E4MaterialSettings] as number, targets.topShine),
    [`${prefix}TopRadial`]: nudge(s[`${prefix}TopRadial` as keyof E4MaterialSettings] as number, targets.topRadial),
    [`${prefix}ShineOpacity`]: nudge(s[`${prefix}ShineOpacity` as keyof E4MaterialSettings] as number, targets.shineOpacity),
    [`${prefix}DiagonalGloss`]: nudge(
      s[`${prefix}DiagonalGloss` as keyof E4MaterialSettings] as number,
      targets.diagonalGloss,
    ),
  };
}

function nudgeGlassReflexCorner(
  s: E4MaterialSettings,
  prefix: 'layerA' | 'layerB',
  corner: 'Tl' | 'Tr' | 'Bl' | 'Br',
  light: number,
  dark: number,
): E4MaterialSettings {
  const lightKey = `${prefix}GlassReflex${corner}Light` as keyof E4MaterialSettings;
  const darkKey = `${prefix}GlassReflex${corner}Dark` as keyof E4MaterialSettings;
  return {
    ...s,
    [lightKey]: nudge(s[lightKey] as number, light),
    [darkKey]: nudge(s[darkKey] as number, dark),
  };
}

function nudgeGlassReflexLayer(s: E4MaterialSettings, prefix: 'layerA' | 'layerB'): E4MaterialSettings {
  let next = { ...s, [`${prefix}GlassReflexMode`]: 3 as const };
  next = nudgeGlassReflexCorner(next, prefix, 'Tl', 1.52, 0.34);
  next = nudgeGlassReflexCorner(next, prefix, 'Tr', 0.72, 0.38);
  next = nudgeGlassReflexCorner(next, prefix, 'Bl', 0.22, 0.58);
  next = nudgeGlassReflexCorner(next, prefix, 'Br', 0.56, 0.6);
  return {
    ...next,
    [`${prefix}GlassReflexLightColor`]: '#F4FCFF',
    [`${prefix}GlassReflexDarkColor`]: '#123A5C',
    [`${prefix}GlassReflexRimPx`]: nudge(s[`${prefix}GlassReflexRimPx` as keyof E4MaterialSettings] as number, 1.25),
    [`${prefix}GlassReflexMaskReach`]: nudge(
      s[`${prefix}GlassReflexMaskReach` as keyof E4MaterialSettings] as number,
      50,
    ),
    [`${prefix}GlassReflexMaskFade`]: nudge(
      s[`${prefix}GlassReflexMaskFade` as keyof E4MaterialSettings] as number,
      78,
    ),
  };
}

/** Nudge both nested panels toward the reference left-nav border, corner, and lighting read. */
export function refineExperimentFivePanels(e5: E4MaterialSettings): E4MaterialSettings {
  let s = nudgeLayerSheet(e5, 'layerA', {
    cornerRadius: 28,
    borderWidth: 24,
    borderOpacity: 50,
    topShine: 62,
    topRadial: 58,
    shineOpacity: 72,
    diagonalGloss: 44,
  });
  s = nudgeLayerSheet(s, 'layerB', {
    cornerRadius: 17,
    borderWidth: 20,
    borderOpacity: 44,
    topShine: 54,
    topRadial: 50,
    shineOpacity: 66,
    diagonalGloss: 38,
  });
  s = {
    ...s,
    layerARimBorderPx: nudge(s.layerARimBorderPx, 1),
    layerARimSideGapTop: nudge(s.layerARimSideGapTop, 16),
    layerARimSideGapBottom: nudge(s.layerARimSideGapBottom, 16),
    layerBRimSideGapTop: nudge(s.layerBRimSideGapTop, 13),
    layerBRimSideGapBottom: nudge(s.layerBRimSideGapBottom, 13),
    layerABezelInsetX: nudge(s.layerABezelInsetX, 11),
    layerABezelInsetY: nudge(s.layerABezelInsetY, 11),
  };
  s = nudgeGlassReflexLayer(s, 'layerA');
  s = nudgeGlassReflexLayer(s, 'layerB');
  return syncE4LayerBLayoutFromBezel(s);
}
