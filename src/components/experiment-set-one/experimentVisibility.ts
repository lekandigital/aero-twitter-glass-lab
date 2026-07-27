export type ExperimentId =
  | 'one'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'eleven'
  // Button placement experiments. Each is a one-layer placement whose saves are
  // the exact source buttons.
  | 'button-left-bottom'
  | 'button-left-top'
  | 'button-middle-right'
  | 'button-middle-left'
  | 'search-bar'
  | 'gear-icon';

/** The button placement experiments, in dock order. */
export const BUTTON_PLACEMENT_EXPERIMENT_IDS = [
  'button-left-bottom',
  'button-left-top',
  'button-middle-right',
  'button-middle-left',
  'search-bar',
  'gear-icon',
] as const satisfies readonly ExperimentId[];

export type ButtonPlacementExperimentId = (typeof BUTTON_PLACEMENT_EXPERIMENT_IDS)[number];

/** Display names for the button placement experiments, in dock order. */
export const BUTTON_PLACEMENT_EXPERIMENTS = [
  { id: 'button-left-bottom', label: 'Button Left Bottom' },
  { id: 'button-left-top', label: 'Button Left Top' },
  { id: 'button-middle-right', label: 'Button Middle Right' },
  { id: 'button-middle-left', label: 'Button Middle Left' },
  { id: 'search-bar', label: 'Search Bar' },
  { id: 'gear-icon', label: 'Gear Icon' },
] as const satisfies readonly { id: ButtonPlacementExperimentId; label: string }[];

export function isButtonPlacementExperiment(id: ExperimentId): id is ButtonPlacementExperimentId {
  return (BUTTON_PLACEMENT_EXPERIMENT_IDS as readonly string[]).includes(id);
}

export type ExperimentVisibility = Record<ExperimentId, boolean>;

export const DEFAULT_EXPERIMENT_VISIBILITY: ExperimentVisibility = {
  one: true,
  two: true,
  three: true,
  four: true,
  five: true,
  six: true,
  seven: true,
  eight: true,
  nine: true,
  ten: true,
  eleven: true,
  'button-left-bottom': true,
  'button-left-top': true,
  'button-middle-right': true,
  'button-middle-left': true,
  'search-bar': true,
  'gear-icon': true,
};

export function normalizeExperimentVisibility(
  raw: Partial<ExperimentVisibility> | undefined,
): ExperimentVisibility {
  return {
    one: raw?.one !== false,
    two: raw?.two !== false,
    three: raw?.three !== false,
    four: raw?.four !== false,
    five: raw?.five !== false,
    six: raw?.six !== false,
    seven: raw?.seven !== false,
    eight: raw?.eight !== false,
    nine: raw?.nine !== false,
    ten: raw?.ten !== false,
    eleven: raw?.eleven !== false,
    'button-left-bottom': raw?.['button-left-bottom'] !== false,
    'button-left-top': raw?.['button-left-top'] !== false,
    'button-middle-right': raw?.['button-middle-right'] !== false,
    'button-middle-left': raw?.['button-middle-left'] !== false,
    'search-bar': raw?.['search-bar'] !== false,
    'gear-icon': raw?.['gear-icon'] !== false,
  };
}
