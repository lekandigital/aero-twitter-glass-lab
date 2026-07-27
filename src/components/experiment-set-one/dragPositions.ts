import {
  clearDragPositionNamespace as clearStoredPositionNamespace,
  loadDragPosition,
  saveDragPosition,
} from '../../utils/dragPositionStorage';

export const EXPERIMENT_SET_ONE_POSITION_KEYS = {
  settingsDock: 'exp-set-1:settings-dock',
  panelOne: 'exp-set-1:panel-one',
  transSheet: 'exp-set-1:trans-sheet',
  frostSheet: 'exp-set-1:frost-sheet',
  layerA: 'exp-set-1:layer-a',
  layerB: 'exp-set-1:layer-b',
  layerA4: 'exp-set-1:layer-a-4',
  layerB4: 'exp-set-1:layer-b-4',
  layerC6: 'exp-set-1:layer-c-6',
  layerA5: 'exp-set-1:layer-a-5',
  layerA8: 'exp-set-1:layer-a-8',
  layerA10: 'exp-set-1:layer-a-10',
  layerB10: 'exp-set-1:layer-b-10',
  layerA11: 'exp-set-1:layer-a-11',
  layerB11: 'exp-set-1:layer-b-11',
  layerC11: 'exp-set-1:layer-c-11',
  layerD11: 'exp-set-1:layer-d-11',
  layerE11: 'exp-set-1:layer-e-11',
} as const;

export const EXPERIMENT_SET_ONE_POSITION_KEY_LIST = Object.values(EXPERIMENT_SET_ONE_POSITION_KEYS);

/**
 * Layer C stores one drag position per mounted reference object, namespaced
 * under its base key, so that a position dragged for one object can never be
 * applied to a differently sized object selected afterwards.
 */
export function experimentElevenLayerCPositionKey(referencePresetId?: string): string {
  const base = EXPERIMENT_SET_ONE_POSITION_KEYS.layerC11;
  return referencePresetId ? `${base}:${referencePresetId}` : base;
}

export function clearAllExperimentSetOnePositions() {
  for (const id of EXPERIMENT_SET_ONE_POSITION_KEY_LIST) {
    clearStoredPositionNamespace(id);
  }
}

export { loadDragPosition, saveDragPosition };
