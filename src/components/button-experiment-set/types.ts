export const BUTTON_EXPERIMENT_SET_ID = 'button-source-experiments' as const;
export const BUTTON_EXPERIMENT_SET_NAME = 'Button Source Experiments' as const;

export const BUTTON_EXPERIMENTS = [
  { id: 'button-left-bottom', label: 'Button Left Bottom' },
  { id: 'button-left-top', label: 'Button Left Top' },
  { id: 'button-middle-right', label: 'Button Middle Right' },
  { id: 'button-middle-left', label: 'Button Middle Left' },
  { id: 'search-bar', label: 'Search Bar' },
  { id: 'gear-icon', label: 'Gear Icon' },
] as const;

export type ButtonExperimentId = (typeof BUTTON_EXPERIMENTS)[number]['id'];
export type ReferenceButtonState = 'default' | 'hovered' | 'checked' | 'other';

export type ReferenceButtonRenderer =
  | 'container-svg'
  | 'filtered-svg'
  | 'aqua-css'
  | 'before-after-css'
  | 'dock-gradient-css'
  | 'glass-generate-css'
  | 'turbo-container-query'
  | 'glass-like-css'
  | 'glass-html-mask'
  | 'liquid-dom-showcase'
  | 'liquid-web-toggle'
  | 'wge-next-motion'
  | 'web-glass-surface'
  | 'ios26-svg-filter'
  | 'liquid-glass-js-webgl';

export type ReferenceButtonPreset = {
  id: string;
  label: string;
  family: string;
  sourceRepository: 'button-projects-lab' | 'glass-projects-lab' | 'inline-user-source';
  sourcePath: string;
  sourceUrl: string;
  sourceSelector?: string;
  sourceComponent?: string;
  sourceKey: string;
  sourceState: ReferenceButtonState;
  nativeWidth: number;
  nativeHeight: number;
  nativeRadius: number;
  renderer: ReferenceButtonRenderer;
  requiredAssets: readonly string[];
  visibleContentPolicy: string;
  hoverBehavior: string;
  pressedBehavior: string;
  focusBehavior: string;
  provenanceHash: string;
  options: Readonly<Record<string, unknown>>;
};

export type ButtonExperimentSave = {
  id: number;
  label: string;
  savedAt: string;
  experimentSetId: typeof BUTTON_EXPERIMENT_SET_ID;
  layerA: {
    presetId: string;
  };
};

/**
 * This experiment set intentionally has one layer in its state model. There
 * are no optional Layer B–E fields to accidentally serialize or revive.
 */
export type ButtonExperimentSetState = {
  selectedExperiment: ButtonExperimentId;
  selectedSaveId: number;
  layerA: {
    presetId: string;
  };
};
