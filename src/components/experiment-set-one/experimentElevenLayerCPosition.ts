/**
 * Experiment Eleven Layer C initial placement.
 *
 * Save 248 is the authority for where the Right overlap pane's Layer C sits.
 * Measured in a clean browser profile (no persisted drag positions), Save 248's
 * Layer C renders at 293 × 125 radius 21, offset (15, 0) from
 * `.experiment-four-layer-a__bezel-inset` — which is also the draggable shell's
 * bounds element and is exactly Layer B's box (322 × 669).
 *
 * That offset is produced by the rule below: horizontally centred inside Layer B,
 * flush against its top edge. The reference-preset branch used a *vertically
 * centred* variant instead, which put the standardized duplicates at (15, 272)
 * — visibly far down the pane and not the requested placement.
 *
 * This module is the single source of truth shared by the runtime renderer, the
 * save generator and the tests, so the three can never disagree.
 */

export const LAYER_C_POSITION_SOURCE_SAVE_ID = 248;

export type ExperimentElevenLayerCPosition = {
  x: number;
  y: number;
};

/**
 * Save 248's Layer C placement rule, applied to any Layer B / Layer C pair.
 * Sub-pixel Layer B widths are preserved through the rounding used by the
 * draggable shell.
 */
export function save248LayerCPosition(
  layerBWidth: number,
  layerCWidth: number,
): ExperimentElevenLayerCPosition {
  return {
    x: Math.max(0, Math.round((layerBWidth - layerCWidth) / 2)),
    y: 0,
  };
}

export function isValidLayerCPosition(
  value: unknown,
): value is ExperimentElevenLayerCPosition {
  if (!value || typeof value !== 'object') return false;
  const { x, y } = value as Partial<ExperimentElevenLayerCPosition>;
  return Number.isFinite(x) && Number.isFinite(y);
}
