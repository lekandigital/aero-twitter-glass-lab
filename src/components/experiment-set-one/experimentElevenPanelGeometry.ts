import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
import { applyExperimentTenPanelGeometry } from './experimentTenPanelGeometry';

/** Experiment Eleven — right overlap pane. */
export const EXPERIMENT_ELEVEN_PANEL_LAYOUT = {
  layerAWidth: 652,
  layerAHeight: 686,
  layerACornerRadius: 20,
  layerBWidth: 642,
  layerBHeight: 674,
  layerBCornerRadius: 16,
} as const;

export function applyExperimentElevenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return applyExperimentTenPanelGeometry({
    ...normalizeE4MaterialSettings(raw),
    ...EXPERIMENT_ELEVEN_PANEL_LAYOUT,
  });
}

export function normalizeExperimentElevenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return applyExperimentElevenPanelGeometry(raw);
}
