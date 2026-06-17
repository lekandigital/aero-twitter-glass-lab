import type { ExperimentSetOneSnapshot } from './savedConfigs';
import { builtInSave74 } from './builtInSave74';
import { REFERENCE_LEFT_PANEL_SURFACE_E4 } from '../experiment-set-four/referenceLeftPanelSurface';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';

export const SAVE_76_ID = 76;
export const SAVE_76_LABEL = 'Save 76 · ref left surface';

/** Experiment Five — Save 74 bezels + reference surface / depth / reflection tuning. */
export function builtInSave76(): ExperimentSetOneSnapshot {
  const base = builtInSave74();
  return {
    ...base,
    id: SAVE_76_ID,
    label: SAVE_76_LABEL,
    savedAt: '2026-06-16T21:00:00.000Z',
    e4: {
      ...base.e4,
      ...REFERENCE_LEFT_PANEL_SURFACE_E4,
    } as Partial<E4MaterialSettings>,
    scope: 'five',
  };
}
