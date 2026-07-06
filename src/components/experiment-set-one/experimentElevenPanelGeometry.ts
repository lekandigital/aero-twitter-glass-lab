import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
/** Experiment Eleven — right overlap pane. */
export const EXPERIMENT_ELEVEN_PANEL_LAYOUT = {
  layerAWidth: 334,
  layerAHeight: 686,
  layerACornerRadius: 20,
  layerBWidth: 322,
  layerBHeight: 669,
  layerBCornerRadius: 16,
} as const;

export function seedExperimentElevenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return {
    ...normalizeE4MaterialSettings(raw),
    ...EXPERIMENT_ELEVEN_PANEL_LAYOUT,
  };
}

export function applyExperimentElevenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return normalizeE4MaterialSettings(raw);
}

export function normalizeExperimentElevenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return normalizeE4MaterialSettings(raw);
}
