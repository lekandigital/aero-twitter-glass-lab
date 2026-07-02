import { ExperimentSetTwoDraggableShell } from '../experiment-set-two/primitives';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from '../experiment-set-one/dragPositions';
import { ExperimentSixLayerCSheet } from './layerCSheet';

export function ExperimentSixLayerCDragInBezel({
  initialPosition,
  layoutResetVersion = 0,
}: {
  initialPosition: { x: number; y: number };
  layoutResetVersion?: number;
}) {
  return (
    <div className="experiment-six-layer-c-drag-bounds experiment-set-two-drag-bounds">
      <ExperimentSetTwoDraggableShell
        bounds="parent"
        initialPosition={initialPosition}
        persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerC6}
        layoutResetVersion={layoutResetVersion}
        ariaLabel="Experiment Six — branch circle on layer B"
        className="experiment-six-layer-c-draggable"
      >
        <ExperimentSixLayerCSheet />
      </ExperimentSetTwoDraggableShell>
    </div>
  );
}
