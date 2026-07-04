import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
import { applyShowcasePanelGeometry } from './showcasePanelGeometry';

export const EXPERIMENT_TEN_PANEL_LAYOUT = {
  layerAWidth: 652,
  layerAHeight: 686,
  layerACornerRadius: 20,
  layerBWidth: 642,
  layerBHeight: 674,
  layerBCornerRadius: 16,
} as const;

export function applyExperimentTenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return applyShowcasePanelGeometry({
    ...normalizeE4MaterialSettings(raw),
    ...EXPERIMENT_TEN_PANEL_LAYOUT,
  });
}

export function normalizeExperimentTenPanelGeometry(raw: E4MaterialSettings): E4MaterialSettings {
  return applyShowcasePanelGeometry(normalizeE4MaterialSettings(raw));
}
