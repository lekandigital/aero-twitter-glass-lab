/**
 * Experiment Five — apply reference left-panel bezel preset (Save 74 values).
 */

import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { applyReferenceLeftPanelBezel } from '../experiment-set-four/referenceLeftPanelBezel';

export const E5_BORDER_REFINEMENTS_VERSION = 3;

export function refineExperimentFivePanels(e5: E4MaterialSettings): E4MaterialSettings {
  return applyReferenceLeftPanelBezel(e5);
}
