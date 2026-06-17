import {
  ExperimentSetOneProvider,
  ExperimentSetOneSettingsDock,
} from '../components/experiment-set-one/combinedSettings';
import { ExperimentSetOneStage } from '../components/experiment-set-one/ExperimentSetOneStage';

/** Experiment Set 1 — Experiments One through Four */
export function ExperimentOne() {
  return (
    <ExperimentSetOneProvider>
      <ExperimentSetOneSettingsDock />

      <header className="experiment-set-one-header">
        <h1>Experiment Set 1</h1>
        <p>
          <strong>Experiment One</strong> is the full bezel panel. <strong>Experiment Two</strong> splits transparent and
          frost into draggable sheets. <strong>Experiment Three</strong> uses reference-tuned layer A (clear bezel) and
          layer B (frost body). <strong>Experiment Four</strong> copies Save 2 with reference left-panel proportions and
          opposite-corner highlights (CodePen PwzzovO).
        </p>
      </header>

      <ExperimentSetOneStage />
    </ExperimentSetOneProvider>
  );
}
