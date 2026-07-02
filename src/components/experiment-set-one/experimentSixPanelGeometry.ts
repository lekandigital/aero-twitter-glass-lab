import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { SHOWCASE_PANEL_SNAP } from './showcasePanelGeometry';

/** Experiment Six — compact nested panel (312×97 outer, 299×85 inner). */
export const EXPERIMENT_SIX_PANEL_LAYOUT = {
  layerAWidth: 312,
  layerAHeight: 97,
  layerACornerRadius: 24,
  layerABezelInsetX: 8,
  layerABezelInsetY: 6,
  layerBWidth: 299,
  layerBHeight: 85,
  layerBCornerRadius: 21,
} as const;

export const EXPERIMENT_SIX_PANEL_SNAP = SHOWCASE_PANEL_SNAP;

export function applyExperimentSixPanelGeometry(s: E4MaterialSettings): E4MaterialSettings {
  return {
    ...s,
    layerAWidth: EXPERIMENT_SIX_PANEL_LAYOUT.layerAWidth,
    layerAHeight: EXPERIMENT_SIX_PANEL_LAYOUT.layerAHeight,
    layerACornerRadius: EXPERIMENT_SIX_PANEL_LAYOUT.layerACornerRadius,
    layerABezelInsetX: EXPERIMENT_SIX_PANEL_LAYOUT.layerABezelInsetX,
    layerABezelInsetY: EXPERIMENT_SIX_PANEL_LAYOUT.layerABezelInsetY,
    layerBWidth: EXPERIMENT_SIX_PANEL_LAYOUT.layerBWidth,
    layerBHeight: EXPERIMENT_SIX_PANEL_LAYOUT.layerBHeight,
    layerBCornerRadius: EXPERIMENT_SIX_PANEL_LAYOUT.layerBCornerRadius,
    layerBNestedInA: true,
  };
}
