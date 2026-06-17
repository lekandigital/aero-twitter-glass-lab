import type { ExperimentSetOneSnapshot } from './savedConfigs';
import { builtInSave22 } from './builtInSave22';
import { REFERENCE_LEFT_PANEL_BEZEL_E4 } from '../experiment-set-four/referenceLeftPanelBezel';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';

export const SAVE_74_ID = 74;
export const SAVE_74_LABEL = 'Save 74 · ref left bezels';

/** Experiment Five default — reference left-panel borders, bezels, and nested frost. */
export function builtInSave74(): ExperimentSetOneSnapshot {
  const base = builtInSave22();
  return {
    ...base,
    id: SAVE_74_ID,
    label: SAVE_74_LABEL,
    savedAt: '2026-06-16T20:00:00.000Z',
    e4: {
      ...base.e4,
      ...REFERENCE_LEFT_PANEL_BEZEL_E4,
    } as Partial<E4MaterialSettings>,
    scope: 'five',
  };
}
