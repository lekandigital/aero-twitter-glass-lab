import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  BUTTON_EXPERIMENTS,
  BUTTON_EXPERIMENT_SET_ID,
  BUTTON_EXPERIMENT_SET_NAME,
  type ButtonExperimentId,
  type ButtonExperimentSetState,
} from '../components/button-experiment-set/types';
import {
  REFERENCE_BUTTON_PRESETS,
  REFERENCE_BUTTON_PRESETS_BY_ID,
} from '../components/button-experiment-set/registry';
import {
  BUTTON_EXPERIMENT_SAVES,
  BUTTON_EXPERIMENT_SAVES_BY_ID,
} from '../components/button-experiment-set/saves';
import { ExactButtonSourceStyles } from '../components/button-experiment-set/ExactButtonSourceStyles';
import { ReferenceButtonRenderer } from '../components/button-experiment-set/ReferenceButtonRenderer';
import { ExperimentSetNav } from '../components/layout/ExperimentSetNav';

const INITIAL_SAVE_ID = BUTTON_EXPERIMENT_SAVES[0].id;
const BUTTON_SELECTION_STORAGE_KEY =
  'aero-twitter-glass-lab:button-source-experiments:v1';

function initialButtonExperimentState(): ButtonExperimentSetState {
  const fallback: ButtonExperimentSetState = {
    selectedExperiment: 'button-left-bottom',
    selectedSaveId: INITIAL_SAVE_ID,
    layerA: {
      presetId: BUTTON_EXPERIMENT_SAVES_BY_ID[INITIAL_SAVE_ID].layerA.presetId,
    },
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(BUTTON_SELECTION_STORAGE_KEY) ?? 'null',
    ) as {
      selectedExperiment?: ButtonExperimentId;
      selectedSaveId?: number;
    } | null;
    const selectedSave =
      saved?.selectedSaveId == null
        ? undefined
        : BUTTON_EXPERIMENT_SAVES_BY_ID[saved.selectedSaveId];
    const selectedExperiment = BUTTON_EXPERIMENTS.some(
      ({ id }) => id === saved?.selectedExperiment,
    )
      ? saved?.selectedExperiment
      : fallback.selectedExperiment;
    if (!selectedSave || !selectedExperiment) return fallback;
    return {
      selectedExperiment,
      selectedSaveId: selectedSave.id,
      layerA: { presetId: selectedSave.layerA.presetId },
    };
  } catch {
    return fallback;
  }
}

function placementScale(
  experimentId: ButtonExperimentId,
  nativeWidth: number,
  nativeHeight: number,
) {
  const maximum = experimentId === 'gear-icon'
    ? { width: 82, height: 82 }
    : experimentId === 'search-bar'
      ? { width: 290, height: 66 }
      : { width: 250, height: 150 };
  return Math.min(1, maximum.width / nativeWidth, maximum.height / nativeHeight);
}

function PlacementObject({
  experimentId,
  presetId,
}: {
  experimentId: ButtonExperimentId;
  presetId: string;
}) {
  const preset = REFERENCE_BUTTON_PRESETS_BY_ID[presetId];
  const scale = placementScale(
    experimentId,
    preset.nativeWidth,
    preset.nativeHeight,
  );
  const viewportStyle = {
    width: preset.nativeWidth * scale,
    height: preset.nativeHeight * scale,
  };
  const objectStyle = {
    transform: `scale(${scale})`,
  };

  return (
    <div
      className="button-experiment-placement__viewport"
      style={viewportStyle}
      data-proportional-scale={scale}
    >
      <div className="button-experiment-placement__object" style={objectStyle}>
        <ReferenceButtonRenderer preset={preset} />
      </div>
    </div>
  );
}

export function ButtonSourceExperiments() {
  const [state, setState] = useState<ButtonExperimentSetState>(
    initialButtonExperimentState,
  );
  const [query, setQuery] = useState('');
  const selectedSave = BUTTON_EXPERIMENT_SAVES_BY_ID[state.selectedSaveId];
  const selectedPreset = REFERENCE_BUTTON_PRESETS_BY_ID[state.layerA.presetId];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSaves = useMemo(
    () => BUTTON_EXPERIMENT_SAVES.filter((save) => {
      if (!normalizedQuery) return true;
      const definition = REFERENCE_BUTTON_PRESETS_BY_ID[save.layerA.presetId];
      return [
        String(save.id),
        save.label,
        definition.id,
        definition.family,
        definition.sourcePath,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    }),
    [normalizedQuery],
  );

  useEffect(() => {
    window.localStorage.setItem(
      BUTTON_SELECTION_STORAGE_KEY,
      JSON.stringify({
        selectedExperiment: state.selectedExperiment,
        selectedSaveId: state.selectedSaveId,
      }),
    );
  }, [state.selectedExperiment, state.selectedSaveId]);

  const selectSave = (saveId: number) => {
    const save = BUTTON_EXPERIMENT_SAVES_BY_ID[saveId];
    if (!save) return;
    setState((current) => ({
      ...current,
      selectedSaveId: save.id,
      layerA: {
        presetId: save.layerA.presetId,
      },
    }));
  };

  const currentIndex = BUTTON_EXPERIMENT_SAVES.findIndex(({ id }) => id === state.selectedSaveId);
  const stepSave = (delta: number) => {
    const nextIndex = (currentIndex + delta + BUTTON_EXPERIMENT_SAVES.length)
      % BUTTON_EXPERIMENT_SAVES.length;
    selectSave(BUTTON_EXPERIMENT_SAVES[nextIndex].id);
  };

  return (
    <main
      className="button-experiment-set"
      data-button-experiment-set={BUTTON_EXPERIMENT_SET_ID}
      data-layer-count="1"
      data-available-layer="A"
    >
      <ExactButtonSourceStyles />
      <ExperimentSetNav />
      <header className="button-experiment-set__header">
        <div>
          <p className="button-experiment-set__eyebrow">Exact-source button laboratory</p>
          <h1>{BUTTON_EXPERIMENT_SET_NAME}</h1>
          <p>
            One selected source preset is rendered through the same Layer A in all six placement
            experiments. Source geometry is preserved; oversized objects are proportionally reduced
            only to fit a placement stage.
          </p>
        </div>
        <div className="button-experiment-set__counts" aria-label="Button inventory summary">
          <strong>{REFERENCE_BUTTON_PRESETS.length}</strong>
          <span>presets</span>
          <strong>{BUTTON_EXPERIMENT_SAVES.length}</strong>
          <span>saves</span>
          <b>Layer A only</b>
        </div>
      </header>

      <section className="button-experiment-controls" aria-label="Button experiment controls">
        <div className="button-experiment-controls__save">
          <label htmlFor="button-source-save">Layer A button save</label>
          <div>
            <button type="button" onClick={() => stepSave(-1)} aria-label="Previous button save">←</button>
            <select
              id="button-source-save"
              value={state.selectedSaveId}
              onChange={(event) => selectSave(Number(event.target.value))}
            >
              {BUTTON_EXPERIMENT_SAVES.map((save) => (
                <option key={save.id} value={save.id}>{save.label}</option>
              ))}
            </select>
            <button type="button" onClick={() => stepSave(1)} aria-label="Next button save">→</button>
          </div>
        </div>

        <label className="button-experiment-controls__filter">
          Filter inventory
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ID, family, source path…"
          />
        </label>

        <div className="button-experiment-controls__layers" aria-label="Available layers">
          <span aria-current="true">Layer A</span>
        </div>
      </section>

      {normalizedQuery && (
        <section className="button-experiment-results" aria-label="Filtered button inventory">
          <p>{visibleSaves.length} matching saves</p>
          <div>
            {visibleSaves.map((save) => (
              <button
                key={save.id}
                type="button"
                className={save.id === state.selectedSaveId ? 'is-selected' : undefined}
                onClick={() => selectSave(save.id)}
              >
                <b>{save.id}</b>
                <span>{REFERENCE_BUTTON_PRESETS_BY_ID[save.layerA.presetId].label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="button-experiment-selected" aria-label="Selected source identity">
        <div>
          <span>Save {selectedSave.id}</span>
          <h2>{selectedPreset.label}</h2>
          <code>{selectedPreset.id}</code>
        </div>
        <dl>
          <div><dt>Family</dt><dd>{selectedPreset.family}</dd></div>
          <div><dt>State</dt><dd>{selectedPreset.sourceState}</dd></div>
          <div>
            <dt>Native</dt>
            <dd>{selectedPreset.nativeWidth} × {selectedPreset.nativeHeight} · r{selectedPreset.nativeRadius}</dd>
          </div>
          <div><dt>Renderer</dt><dd>{selectedPreset.renderer}</dd></div>
        </dl>
      </section>

      <section className="button-experiment-grid" aria-label="Six one-layer button experiments">
        {BUTTON_EXPERIMENTS.map((experiment) => (
          <article
            key={experiment.id}
            className={`button-experiment-card${state.selectedExperiment === experiment.id ? ' is-active' : ''}`}
            data-button-experiment={experiment.id}
            data-layer-count="1"
          >
            <button
              type="button"
              className="button-experiment-card__heading"
              onClick={() => setState((current) => ({
                ...current,
                selectedExperiment: experiment.id,
              }))}
              aria-pressed={state.selectedExperiment === experiment.id}
            >
              <span>{experiment.label}</span>
              <small>Layer A</small>
            </button>
            <div
              className={`button-experiment-stage button-experiment-stage--${experiment.id}`}
              aria-label={`${experiment.label} stage`}
            >
              <div
                className="button-experiment-placement-context"
                data-placement-slot={experiment.id}
                aria-hidden="true"
              />
              <div
                className="button-experiment-layer-a"
                data-layer="A"
                data-selected-preset={selectedPreset.id}
                style={{ '--placement-radius': `${selectedPreset.nativeRadius}px` } as CSSProperties}
              >
                <PlacementObject experimentId={experiment.id} presetId={selectedPreset.id} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <details className="button-experiment-provenance">
        <summary>Selected preset provenance and exact interaction contract</summary>
        <dl>
          <div><dt>Repository</dt><dd>{selectedPreset.sourceRepository}</dd></div>
          <div><dt>Path</dt><dd>{selectedPreset.sourcePath}</dd></div>
          <div><dt>Selector/component</dt><dd>{selectedPreset.sourceSelector ?? selectedPreset.sourceComponent}</dd></div>
          <div><dt>Visible content</dt><dd>{selectedPreset.visibleContentPolicy}</dd></div>
          <div><dt>Hover</dt><dd>{selectedPreset.hoverBehavior}</dd></div>
          <div><dt>Pressed</dt><dd>{selectedPreset.pressedBehavior}</dd></div>
          <div><dt>Focus</dt><dd>{selectedPreset.focusBehavior}</dd></div>
          <div><dt>SHA-256</dt><dd><code>{selectedPreset.provenanceHash}</code></dd></div>
        </dl>
      </details>
    </main>
  );
}
