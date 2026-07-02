/** Draggable panels for Experiment Set 1 — positions persist across refresh. */
import {
  ExperimentOneDraggablePanel,
  ExperimentOneGlassPanel,
} from '../experiment-one/primitives';
import {
  ExperimentTwoDraggableSheet,
  ExperimentTwoFrostSheet,
  ExperimentTwoTransparentSheet,
} from '../experiment-set-two/primitives';
import {
  ExperimentThreeDraggableLayerA,
  ExperimentThreeDraggableLayerB,
} from '../experiment-set-three/primitives';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import { useExperimentSetOne } from './combinedSettings';
import { VariantPanelSlots } from './VariantPanelSlots';

export function ExperimentSetOneStage() {
  const { layoutResetVersion, activeExperiment, e4, e7 } = useExperimentSetOne();
  const nestedB = e4.layerBNestedInA;
  const show = (id: 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight') => id === activeExperiment;

  return (
    <main className="experiment-set-one-stage" aria-label="Experiment Set 1 panel stage">
      <div className="experiment-set-one-stage__canvas">
        {show('one') && (
          <ExperimentOneDraggablePanel
            initialPosition={{ x: 40, y: 40 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.panelOne}
            layoutResetVersion={layoutResetVersion}
          >
            <ExperimentOneGlassPanel className="experiment-one-panel--hero">
              <p className="experiment-one-panel__eyebrow">Glass Surface</p>
              <h2 className="experiment-one-panel__title">Experiment One</h2>
              <p className="experiment-one-panel__subtitle">Bezel + layered material study</p>
              <p className="experiment-one-panel__body">
                Transparency, bevel, reflection, frost, rim, and depth.
              </p>
              <p className="experiment-one-panel__drag-hint">Hold and drag to sample background · click layers to inspect</p>
            </ExperimentOneGlassPanel>
          </ExperimentOneDraggablePanel>
        )}

        {show('two') && (
          <>
            <ExperimentTwoDraggableSheet
              initialPosition={{ x: 520, y: 200 }}
              persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.transSheet}
              layoutResetVersion={layoutResetVersion}
              ariaLabel="Experiment Two — transparent sheet"
            >
              <ExperimentTwoTransparentSheet />
            </ExperimentTwoDraggableSheet>

            <ExperimentTwoDraggableSheet
              initialPosition={{ x: 600, y: 100 }}
              persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.frostSheet}
              layoutResetVersion={layoutResetVersion}
              raised
              ariaLabel="Experiment Two — frost sheet"
            >
              <ExperimentTwoFrostSheet />
            </ExperimentTwoDraggableSheet>
          </>
        )}

        {show('three') && (
          <>
            <ExperimentThreeDraggableLayerA
              initialPosition={{ x: 120, y: 320 }}
              persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA}
              layoutResetVersion={layoutResetVersion}
            />
            <ExperimentThreeDraggableLayerB
              initialPosition={{ x: 200, y: 260 }}
              persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB}
              layoutResetVersion={layoutResetVersion}
            />
          </>
        )}

        {show('four') && (
          <VariantPanelSlots
            experiment="four"
            layoutResetVersion={layoutResetVersion}
            nestedB={nestedB}
          />
        )}

        {show('five') && (
          <VariantPanelSlots
            experiment="five"
            layoutResetVersion={layoutResetVersion}
            nestedB={nestedB}
          />
        )}

        {show('six') && (
          <VariantPanelSlots
            experiment="six"
            layoutResetVersion={layoutResetVersion}
            nestedB={true}
          />
        )}

        {show('seven') && (
          <VariantPanelSlots
            experiment="seven"
            layoutResetVersion={layoutResetVersion}
            nestedB={e7.layerBNestedInA}
          />
        )}

        {show('eight') && (
          <VariantPanelSlots
            experiment="eight"
            layoutResetVersion={layoutResetVersion}
            nestedB={true}
          />
        )}

      </div>
    </main>
  );
}
