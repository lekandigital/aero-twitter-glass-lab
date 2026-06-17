import { loadExperimentSetOneSaves } from '../experiment-set-one/savedConfigs';
import { builtInSave22 } from '../experiment-set-one/builtInSave22';

/** E5 lab footprint — matches Save 22 / Save 19 layout (not reference.png 210px shell). */
export const E5_PANEL_LAYOUT_FALLBACK = (() => {
  const e4 = builtInSave22().e4!;
  return {
    layerAWidth: e4.layerAWidth as number,
    layerAHeight: e4.layerAHeight as number,
    layerABezelInsetX: e4.layerABezelInsetX as number,
    layerABezelInsetY: e4.layerABezelInsetY as number,
    layerACornerRadius: e4.layerACornerRadius as number,
  };
})();

/** Prefer Save 28, then Save 19 — historical E5 layout anchors in local saves. */
export function e5LayoutPresetFromSaves() {
  const saves = loadExperimentSetOneSaves();
  const layoutSave =
    saves.find((s) => s.id === 28 || s.label === 'Save 28') ??
    saves.find((s) => s.id === 19 || s.label === 'Save 19');
  const e4 = layoutSave?.e4;
  if (!e4) return E5_PANEL_LAYOUT_FALLBACK;
  return {
    layerAWidth: e4.layerAWidth as number,
    layerAHeight: e4.layerAHeight as number,
    layerABezelInsetX: e4.layerABezelInsetX as number,
    layerABezelInsetY: e4.layerABezelInsetY as number,
    layerACornerRadius: e4.layerACornerRadius as number,
  };
}
