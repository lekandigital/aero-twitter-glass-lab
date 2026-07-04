/** Draggable panels for Experiment Set 1 — positions persist across refresh. */
import type { CSSProperties, ReactNode } from 'react';
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
import { e4SettingsToCssVars, type E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import { useExperimentSetOne } from './combinedSettings';
import { VariantPanelSlots } from './VariantPanelSlots';
import { SelectedSaveStagePanels } from './SelectedSavePreviews';
import type { ExperimentId } from './experimentVisibility';

const STAGE_EXPERIMENTS: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const MULTI_EXPERIMENT_CASCADE_STEP = 28;

function selectedSaveCount(selectedSaveKeysByExperiment: Partial<Record<ExperimentId, string[]>>) {
  return Object.values(selectedSaveKeysByExperiment).reduce((count, keys) => count + (keys?.length ?? 0), 0);
}

export function ExperimentSetOneStage() {
  const {
    layoutResetVersion,
    activeExperiment,
    e4,
    e5,
    e6,
    e7,
    e8,
    e9,
    e10,
    selectedExperimentIds,
    selectedSaveKeysByExperiment,
  } = useExperimentSetOne();
  const nestedB = e4.layerBNestedInA;
  const saveMultiActive = selectedSaveCount(selectedSaveKeysByExperiment) > 0;
  const experimentMultiActive = selectedExperimentIds.length > 1;
  const visibleExperimentIds = saveMultiActive
    ? []
    : experimentMultiActive
      ? STAGE_EXPERIMENTS.filter((id) => selectedExperimentIds.includes(id))
      : [activeExperiment];
  const visibleExperimentSet = new Set(visibleExperimentIds);
  const show = (id: ExperimentId) => visibleExperimentSet.has(id);
  const multiExperimentLayout = !saveMultiActive && experimentMultiActive;
  const materialForExperiment = (id: ExperimentId): E4MaterialSettings | null => {
    if (id === 'four') return e4;
    if (id === 'five') return e5;
    if (id === 'six') return e6;
    if (id === 'seven') return e7;
    if (id === 'eight') return e8;
    if (id === 'nine') return e9;
    if (id === 'ten') return e10;
    return null;
  };
  const stageShell = (id: ExperimentId, children: ReactNode) => {
    const visibleIndex = visibleExperimentIds.indexOf(id);
    if (visibleIndex === -1) return null;
    const material = materialForExperiment(id);
    const style = {
      ...(material ? e4SettingsToCssVars(material) : {}),
      ...(multiExperimentLayout
        ? {
            transform: `translate(${visibleIndex * MULTI_EXPERIMENT_CASCADE_STEP}px, ${visibleIndex * MULTI_EXPERIMENT_CASCADE_STEP}px)`,
            zIndex: 12 + visibleExperimentIds.length - visibleIndex,
          }
        : {}),
    } as CSSProperties;
    return (
      <div
        className="experiment-set-one-stage__multi-shell"
        data-stage-experiment={id}
        data-stage-multi={multiExperimentLayout || saveMultiActive}
        style={style}
      >
        {children}
      </div>
    );
  };

  return (
    <main className="experiment-set-one-stage" aria-label="Experiment Set 1 panel stage">
      <div className="experiment-set-one-stage__canvas">
        {show('one') && stageShell('one', (
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
        ))}

        {show('two') && stageShell('two', (
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
        ))}

        {show('three') && stageShell('three', (
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
        ))}

        {show('four') && stageShell('four', (
          <VariantPanelSlots
            experiment="four"
            layoutResetVersion={layoutResetVersion}
            nestedB={nestedB}
          />
        ))}

        {show('five') && stageShell('five', (
          <VariantPanelSlots
            experiment="five"
            layoutResetVersion={layoutResetVersion}
            nestedB={nestedB}
          />
        ))}

        {show('six') && stageShell('six', (
          <VariantPanelSlots
            experiment="six"
            layoutResetVersion={layoutResetVersion}
            nestedB={true}
          />
        ))}

        {show('seven') && stageShell('seven', (
          <VariantPanelSlots
            experiment="seven"
            layoutResetVersion={layoutResetVersion}
            nestedB={e7.layerBNestedInA}
          />
        ))}

        {show('eight') && stageShell('eight', (
          <VariantPanelSlots
            experiment="eight"
            layoutResetVersion={layoutResetVersion}
            nestedB={true}
          />
        ))}

        {show('nine') && stageShell('nine', (
          <VariantPanelSlots
            experiment="nine"
            layoutResetVersion={layoutResetVersion}
            nestedB={e9.layerBNestedInA}
          />
        ))}

        {show('ten') && stageShell('ten', (
          <VariantPanelSlots
            experiment="ten"
            layoutResetVersion={layoutResetVersion}
            nestedB={e10.layerBNestedInA}
          />
        ))}

        <SelectedSaveStagePanels />
      </div>
    </main>
  );
}
