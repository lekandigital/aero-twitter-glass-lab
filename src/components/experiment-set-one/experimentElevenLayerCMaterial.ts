import {
  normalizeE4MaterialSettings,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';

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
    layerBHeight: Math.max(1, Math.round((material.layerBHeight as number) / 5)),
  };
}
