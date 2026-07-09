import { useExperimentSetOne } from './combinedSettings';

/** Stage visibility for layer A/B/C/D/E draggables (E3/E4/E5/E6/E11). */
export function useLayerStageVisibility() {
  const { layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible } = useExperimentSetOne();
  return { layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible };
}
