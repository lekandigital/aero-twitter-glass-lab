import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExperimentSetOne } from '../experiment-set-one/combinedSettings';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
import { experimentSixLayerCDefaultOffset } from './layerCMaterialSettings';
import { ExperimentSixLayerCDragInBezel } from './layerCDragInBezel';

/** Branch variant panels — mount draggable C into the nested B inset via portal. */
export function ExperimentSixLayerCBezelPortal({ layoutResetVersion }: { layoutResetVersion: number }) {
  const { layerCVisible, e6, e6LayerC } = useExperimentSetOne();
  const { slug } = useRenderVariant();
  const showLayerC = layerCVisible;
  const [inset, setInset] = useState<HTMLElement | null>(null);

  const initialPosition = useMemo(() => experimentSixLayerCDefaultOffset(e6LayerC, e6), [e6LayerC, e6]);

  useLayoutEffect(() => {
    if (!showLayerC) {
      setInset(null);
      return;
    }
    const found = document.querySelector<HTMLElement>(
      '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
    );
    setInset(found);
    return () => setInset(null);
  }, [layoutResetVersion, slug, showLayerC]);

  if (!showLayerC || !inset) return null;

  return createPortal(
    <ExperimentSixLayerCDragInBezel initialPosition={initialPosition} layoutResetVersion={layoutResetVersion} />,
    inset,
  );
}
