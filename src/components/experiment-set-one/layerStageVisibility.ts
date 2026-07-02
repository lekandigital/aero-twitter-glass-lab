import { useExperimentSetOne } from './combinedSettings';

/** Stage visibility for layer A/B/C draggables (E3/E4/E5/E6). */
export function useLayerStageVisibility() {
  const { layerAVisible, layerBVisible, layerCVisible } = useExperimentSetOne();
  return { layerAVisible, layerBVisible, layerCVisible };
}
