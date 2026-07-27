import { E1_DEFAULT_SETTINGS } from '../experiment-one/materialSettings';
import { E2_DEFAULT_SETTINGS } from '../experiment-set-two/materialSettings';
import { buildInitialE3Settings } from '../experiment-set-three/materialSettings';
import { BUTTON_EXPERIMENT_SAVES } from '../button-experiment-set/saves';
import {
  BUTTON_PLACEMENT_EXPERIMENT_IDS,
  BUTTON_PLACEMENT_EXPERIMENTS,
  isButtonPlacementExperiment,
  type ButtonPlacementExperimentId,
  type ExperimentId,
} from './experimentVisibility';

export { BUTTON_PLACEMENT_EXPERIMENTS };
import type { ExperimentSetOneSnapshot } from './savedConfigs';

export const BUTTON_PLACEMENT_LABELS = Object.fromEntries(
  BUTTON_PLACEMENT_EXPERIMENTS.map(({ id, label }) => [id, label]),
) as Record<ButtonPlacementExperimentId, string>;

const BASE_MATERIALS = {
  e1: E1_DEFAULT_SETTINGS,
  e2: E2_DEFAULT_SETTINGS,
  e3: buildInitialE3Settings(),
};

/**
 * The button saves presented as Experiment Set One snapshots for one placement.
 *
 * The same 59 buttons are available to every placement — a button is a source
 * object, and the placement is where it is mounted — so the list is identical
 * per experiment and only the scope differs.
 */
function placementSaves(experiment: ButtonPlacementExperimentId): ExperimentSetOneSnapshot[] {
  return BUTTON_EXPERIMENT_SAVES.map((save) => ({
    ...BASE_MATERIALS,
    id: save.id,
    label: save.label,
    savedAt: save.savedAt,
    scope: experiment,
    buttonPresetId: save.layerA.presetId,
  }));
}

const SAVES_BY_PLACEMENT = Object.fromEntries(
  BUTTON_PLACEMENT_EXPERIMENT_IDS.map((id) => [id, placementSaves(id)]),
) as Record<ButtonPlacementExperimentId, ExperimentSetOneSnapshot[]>;

export function buttonPlacementSaves(experiment: ExperimentId): ExperimentSetOneSnapshot[] {
  return isButtonPlacementExperiment(experiment) ? SAVES_BY_PLACEMENT[experiment] : [];
}

export function buttonPresetForSave(
  experiment: ExperimentId,
  saveId: number | null | undefined,
): string | null {
  if (saveId == null || !isButtonPlacementExperiment(experiment)) return null;
  return SAVES_BY_PLACEMENT[experiment].find((save) => save.id === saveId)?.buttonPresetId ?? null;
}
