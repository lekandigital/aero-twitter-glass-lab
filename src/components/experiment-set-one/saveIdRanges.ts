/**
 * Reserved save-id ranges.
 *
 * Experiment Set One and the Button Source Experiments are two separate data
 * systems that happen to share one numbering line. These ranges are the contract
 * that keeps them apart:
 *
 *   1038–1091  Experiment Eleven reference glass saves (generated)
 *   1092–1150  Button Source Experiment saves (owned by
 *              `src/components/button-experiment-set/saves.ts`, never stored in
 *              `src/data/experiment-set-one/saves.json`)
 *   1151+      later Experiment Set One user-created saves
 *
 * A stale browser profile can still hold Experiment Set One records inside the
 * button block from before the reservation existed, so hydration migrates them
 * rather than trusting the committed JSON alone.
 */

export const EXPERIMENT_ELEVEN_REFERENCE_SAVE_RANGE = { start: 1038, end: 1091 } as const;
export const BUTTON_EXPERIMENT_SAVE_RANGE = { start: 1092, end: 1150 } as const;
export const EXPERIMENT_SET_ONE_USER_SAVE_START = 1151 as const;

export function isButtonExperimentSaveId(id: number): boolean {
  return id >= BUTTON_EXPERIMENT_SAVE_RANGE.start && id <= BUTTON_EXPERIMENT_SAVE_RANGE.end;
}

export function isExperimentElevenReferenceSaveId(id: number): boolean {
  return (
    id >= EXPERIMENT_ELEVEN_REFERENCE_SAVE_RANGE.start &&
    id <= EXPERIMENT_ELEVEN_REFERENCE_SAVE_RANGE.end
  );
}

type MigratableSnapshot = {
  id: number;
  label?: string;
  /** Present only on Button Source Experiment records. */
  experimentSetId?: string;
  layerA?: unknown;
  e1?: unknown;
  e2?: unknown;
  e3?: unknown;
  cornersOnly?: boolean;
};

/**
 * A record inside the button block that is a Button Source Experiment save
 * rather than a genuine Experiment Set One save. These are regenerated from the
 * button registry, so a stray copy in Experiment Set One storage is discarded.
 */
function isStrayButtonRecord(save: MigratableSnapshot): boolean {
  if (save.experimentSetId === 'button-source-experiments') return true;
  // Button saves carry `layerA` and none of the Experiment Set One material sets.
  return Boolean(save.layerA) && !save.e1 && !save.e2 && !save.e3;
}

export type SaveIdMigrationResult<T> = {
  saves: T[];
  movedIds: { from: number; to: number }[];
  droppedIds: number[];
};

/**
 * Moves genuine Experiment Set One records out of the reserved button block and
 * drops stray button records. Idempotent: running it on an already-migrated list
 * changes nothing, because nothing then remains inside the reserved block.
 */
export function migrateReservedButtonRangeSaves<T extends MigratableSnapshot>(
  saves: readonly T[],
): SaveIdMigrationResult<T> {
  const movedIds: { from: number; to: number }[] = [];
  const droppedIds: number[] = [];
  const offending = saves.filter((save) => !save.cornersOnly && isButtonExperimentSaveId(save.id));
  if (offending.length === 0) {
    return { saves: [...saves], movedIds, droppedIds };
  }

  const usedIds = new Set(saves.map((save) => save.id));
  let nextId = EXPERIMENT_SET_ONE_USER_SAVE_START;
  const allocate = () => {
    while (usedIds.has(nextId) || isButtonExperimentSaveId(nextId)) nextId += 1;
    usedIds.add(nextId);
    return nextId;
  };

  const migrated: T[] = [];
  for (const save of saves) {
    if (save.cornersOnly || !isButtonExperimentSaveId(save.id)) {
      migrated.push(save);
      continue;
    }
    if (isStrayButtonRecord(save)) {
      droppedIds.push(save.id);
      continue;
    }
    const from = save.id;
    const to = allocate();
    movedIds.push({ from, to });
    // Labels, timestamps, configuration and provenance are preserved; only an
    // auto-generated "Save <id>" label is renumbered to stay truthful.
    const label =
      typeof save.label === 'string' && save.label.trim() === `Save ${from}`
        ? `Save ${to}`
        : save.label;
    migrated.push({ ...save, id: to, ...(label === undefined ? {} : { label }) });
  }

  return { saves: migrated, movedIds, droppedIds };
}

/**
 * Sort key for the Experiment Set One save list.
 *
 * Standardized Right-overlap duplicates carry a `displayId` such as `1068b`,
 * meaning "the b variant of Save 1068". Sorting on the numeric id alone would
 * park all twelve after 1079; this key interleaves each duplicate directly
 * after the save it duplicates, giving 1068, 1068b, 1069, 1069b, ...
 */
export function experimentSetOneSaveSortKey(save: {
  id: number;
  displayId?: string;
}): [number, number] {
  const match = /^(\d+)([a-z])$/.exec(save.displayId ?? '');
  if (!match) return [save.id, 0];
  return [Number(match[1]), match[2].charCodeAt(0) - 96];
}
