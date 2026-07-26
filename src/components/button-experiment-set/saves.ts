import {
  BUTTON_EXPERIMENT_SET_ID,
  type ButtonExperimentSave,
} from './types.ts';
import {
  REFERENCE_BUTTON_EXPECTED_COUNT,
  REFERENCE_BUTTON_PRESETS,
} from './registry.ts';

export const BUTTON_SAVE_ID_START = 1092 as const;
export const BUTTON_SAVE_ID_END = 1150 as const;

const SAVED_AT_BASE = Date.parse('2026-07-26T12:00:00.000Z');

export const BUTTON_EXPERIMENT_SAVES: readonly ButtonExperimentSave[] =
  REFERENCE_BUTTON_PRESETS.map((definition, index) => {
    const id = BUTTON_SAVE_ID_START + index;
    return {
      id,
      label: `Save ${id} · ${definition.label}`,
      savedAt: new Date(SAVED_AT_BASE + index * 1000).toISOString(),
      experimentSetId: BUTTON_EXPERIMENT_SET_ID,
      layerA: {
        presetId: definition.id,
      },
    };
  });

export const BUTTON_EXPERIMENT_SAVES_BY_ID = Object.fromEntries(
  BUTTON_EXPERIMENT_SAVES.map((save) => [save.id, save]),
) as Readonly<Record<number, ButtonExperimentSave>>;

if (BUTTON_EXPERIMENT_SAVES.length !== REFERENCE_BUTTON_EXPECTED_COUNT) {
  throw new Error('Every reference button preset must have exactly one save');
}

if (BUTTON_EXPERIMENT_SAVES.at(-1)?.id !== BUTTON_SAVE_ID_END) {
  throw new Error(`Button save range must end at ${BUTTON_SAVE_ID_END}`);
}

if (new Set(BUTTON_EXPERIMENT_SAVES.map(({ id }) => id)).size !== BUTTON_EXPERIMENT_SAVES.length) {
  throw new Error('Button save IDs must be unique');
}

export const BUTTON_INVENTORY_AUDIT = REFERENCE_BUTTON_PRESETS.map((definition, index) => ({
  saveId: BUTTON_SAVE_ID_START + index,
  presetId: definition.id,
  label: definition.label,
  sourceFamily: definition.family,
  sourceRepository: definition.sourceRepository,
  sourcePath: definition.sourcePath,
  selectorOrComponent: definition.sourceSelector ?? definition.sourceComponent ?? '',
  sourceState: definition.sourceState,
  nativeWidth: definition.nativeWidth,
  nativeHeight: definition.nativeHeight,
  nativeRadius: definition.nativeRadius,
  renderer: definition.renderer,
  provenanceHash: definition.provenanceHash,
}));
