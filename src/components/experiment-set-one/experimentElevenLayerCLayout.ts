/**
 * Experiment Eleven Layer C layout — the single source of truth for the
 * right-overlap pane's Layer C geometry (the "Save 248 Layer C" geometry).
 *
 * This lives in its own dependency-free leaf module so that both the React
 * material layer (`experimentElevenLayerCMaterial.ts`) and the plain-TypeScript
 * preset registry (`experimentElevenReferencePresets.ts`, which is loaded
 * directly by `node --test` and by the save generator) can share one definition
 * without pulling React into a non-React context.
 *
 * `experimentElevenLayerCMaterial.ts` re-exports both symbols, so existing
 * import sites keep working unchanged.
 */

export type ExperimentElevenLayerCLayoutSettings = {
  width: number;
  height: number;
  radius: number;
};

export const EXPERIMENT_ELEVEN_LAYER_C_LAYOUT = {
  width: 293,
  height: 125,
  radius: 21,
} as const satisfies ExperimentElevenLayerCLayoutSettings;
