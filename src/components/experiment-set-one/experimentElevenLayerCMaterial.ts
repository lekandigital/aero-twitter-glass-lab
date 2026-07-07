import {
  normalizeE4MaterialSettings,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';

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

export function normalizeExperimentElevenLayerCOverride(
  base: E4MaterialSettings,
  override?: Partial<E4MaterialSettings> | null,
): E4MaterialSettings {
  return normalizeE4MaterialSettings({
    ...base,
    ...(override ?? {}),
  });
}

export function experimentElevenLayerCDisplayMaterial(
  base: E4MaterialSettings,
  override?: Partial<E4MaterialSettings> | null,
): E4MaterialSettings {
  const material = normalizeExperimentElevenLayerCOverride(base, override);
  return {
    ...material,
    layerBWidth: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width,
    layerBHeight: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height,
    layerBCornerRadius: EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius,
  };
}

export function experimentElevenLayerCLayoutFromMaterial(
  material: E4MaterialSettings,
): ExperimentElevenLayerCLayoutSettings {
  return {
    width: material.layerBWidth as number,
    height: material.layerBHeight as number,
    radius: material.layerBCornerRadius as number,
  };
}

export function applyExperimentElevenLayerCLayout(
  material: E4MaterialSettings,
  layout: ExperimentElevenLayerCLayoutSettings,
): E4MaterialSettings {
  return normalizeE4MaterialSettings({
    ...material,
    layerBWidth: Math.max(16, Math.round(layout.width)),
    layerBHeight: Math.max(1, Math.round(layout.height)),
    layerBCornerRadius: Math.max(0, Math.round(layout.radius)),
  });
}
