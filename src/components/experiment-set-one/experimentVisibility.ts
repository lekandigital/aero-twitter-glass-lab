export type ExperimentId = 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten';

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
  };
}
