import {
  clearDragPosition as clearStoredPosition,
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
  layerA5: 'exp-set-1:layer-a-5',
} as const;

export const EXPERIMENT_SET_ONE_POSITION_KEY_LIST = Object.values(EXPERIMENT_SET_ONE_POSITION_KEYS);

export function clearAllExperimentSetOnePositions() {
  for (const id of EXPERIMENT_SET_ONE_POSITION_KEY_LIST) {
    clearStoredPosition(id);
  }
}

export { loadDragPosition, saveDragPosition };
