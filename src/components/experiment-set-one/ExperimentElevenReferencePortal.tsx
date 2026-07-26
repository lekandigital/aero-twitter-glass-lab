import {
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { useExperimentElevenReferencePortalGeometry } from './experimentElevenReferencePortalGeometry';

export function ExperimentElevenReferencePortal({
  anchorRef,
  presetId,
  sourceFamily,
  rendererType,
  nativeWidth,
  nativeHeight,
  nativeRadius,
  renderWidth = nativeWidth,
  renderHeight = nativeHeight,
  renderOffsetX = 0,
  renderOffsetY = 0,
  renderRadius = nativeRadius,
  interactive = false,
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  presetId: string;
  sourceFamily: string;
  rendererType: string;
  nativeWidth: number;
  nativeHeight: number;
  nativeRadius: number;
  /**
   * Optional transparent technical box around the native glass. The draggable
   * anchor keeps the glass's exact native geometry while source motion can use
   * its original coordinate area without painting a demo background.
   */
  renderWidth?: number;
  renderHeight?: number;
  renderOffsetX?: number;
  renderOffsetY?: number;
  renderRadius?: number;
  interactive?: boolean;
  children: ReactNode;
}) {
  const geometry = useExperimentElevenReferencePortalGeometry(
    anchorRef,
    nativeWidth,
    nativeHeight,
  );

  if (typeof document === 'undefined' || !geometry) return null;

  const hostLeft = geometry.left - renderOffsetX * geometry.scaleX;
  const hostTop = geometry.top - renderOffsetY * geometry.scaleY;

  return createPortal(
    <div
      className="experiment-eleven-reference-overlay"
      data-e11-reference-overlay=""
      data-e11-reference-preset={presetId}
      data-e11-reference-family={sourceFamily}
      data-source-family={sourceFamily}
      data-e11-reference-renderer={rendererType}
      data-transparent-render-surface="true"
    >
      <div
        className={`experiment-eleven-reference-host${
          interactive ? ' experiment-eleven-reference-host--interactive' : ''
        }`}
        data-e11-reference-native-width={nativeWidth}
        data-e11-reference-native-height={nativeHeight}
        data-e11-reference-render-width={renderWidth}
        data-e11-reference-render-height={renderHeight}
        data-e11-reference-render-offset-x={renderOffsetX}
        data-e11-reference-render-offset-y={renderOffsetY}
        data-transparent-render-surface="true"
        style={{
          left: hostLeft,
          top: hostTop,
          width: renderWidth,
          height: renderHeight,
          borderRadius: renderRadius,
          transform: `scale(${geometry.scaleX}, ${geometry.scaleY})`,
        }}
      >
        <div className="experiment-eleven-reference-renderer">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
