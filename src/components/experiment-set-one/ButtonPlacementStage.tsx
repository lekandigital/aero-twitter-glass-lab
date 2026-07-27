import { useLayoutEffect, useState } from 'react';
import { ReferenceButtonRenderer } from '../button-experiment-set/ReferenceButtonRenderer';
import { REFERENCE_BUTTON_PRESETS_BY_ID } from '../button-experiment-set/registry';
import { ExperimentSetTwoDraggableShell } from '../experiment-set-two/primitives';
import { buttonPlacementPositionKey } from './dragPositions';
import { BUTTON_PLACEMENT_LABELS, buttonPresetForSave } from './buttonPlacementSaves';
import type { ButtonPlacementExperimentId } from './experimentVisibility';

/**
 * One button placement experiment on the Experiment Set 1 stage.
 *
 * Layer A only: the selected save's exact source button is mounted inside the
 * same draggable shell every other experiment uses, so it opens centred in the
 * stage and can be dragged like any other layer. Each placement keeps its own
 * persisted position.
 */
export function ButtonPlacementStage({
  experiment,
  selectedSaveId,
  layoutResetVersion = 0,
}: {
  experiment: ButtonPlacementExperimentId;
  selectedSaveId: number | null;
  layoutResetVersion?: number;
}) {
  const presetId = buttonPresetForSave(experiment, selectedSaveId);
  const preset = presetId ? REFERENCE_BUTTON_PRESETS_BY_ID[presetId] : undefined;
  const label = BUTTON_PLACEMENT_LABELS[experiment];

  /*
   * Centre on the *screen*, not on the drag bounds.
   *
   * The stage canvas is wider than the window and starts off-screen to the
   * left, and an ancestor transform traps `position: fixed`, so neither
   * `initialPosition="center"` nor viewport bounds lands the button in the
   * middle of the screen. Measure the shell's own bounds origin and offset the
   * screen centre by it.
   */
  const objectWidth = preset?.nativeWidth ?? 120;
  const objectHeight = preset?.nativeHeight ?? 40;
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const shell = document.querySelector<HTMLElement>(
        `[data-stage-experiment="${experiment}"]`,
      );
      if (!shell) return;
      const origin = shell.getBoundingClientRect();
      setInitialPosition({
        x: Math.round((window.innerWidth - objectWidth) / 2 - origin.left),
        y: Math.round((window.innerHeight - objectHeight) / 2 - origin.top),
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [experiment, objectWidth, objectHeight]);

  // Wait for the measurement so the shell mounts already centred.
  if (!initialPosition) return null;

  return (
    <ExperimentSetTwoDraggableShell
      // Opens centred on screen, then draggable.
      key={`${initialPosition.x}:${initialPosition.y}`}
      initialPosition={initialPosition}
      bounds="parent-overflow"
      persistKey={buttonPlacementPositionKey(experiment)}
      layoutResetVersion={layoutResetVersion}
      ariaLabel={`${label} — drag to reposition`}
      className="experiment-button-placement-draggable"
    >
      <div
        className="experiment-button-placement"
        data-button-placement={experiment}
        data-layer-count="1"
        data-available-layer="A"
        data-selected-save={selectedSaveId ?? ''}
        data-selected-preset={preset?.id ?? ''}
        aria-label={`${label} placement`}
      >
        {preset ? (
          <div className="experiment-button-placement__layer" data-layer="A">
            <ReferenceButtonRenderer preset={preset} />
          </div>
        ) : (
          <p className="experiment-button-placement__empty">{label} — pick a button save</p>
        )}
      </div>
    </ExperimentSetTwoDraggableShell>
  );
}
