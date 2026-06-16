import { useRef, type CSSProperties } from 'react';
import { e4InspectAttrs } from '../experiment-set-four/materialSettings';
import { useEdgeReflexBackdrop } from './useEdgeReflexBackdrop';

const PWZZOV_REFLEX_REGIONS = ['tl', 'tr', 'bl', 'br', 'left', 'right'] as const;

type PwzzovOGlassCornersProps = {
  layerClass: 'experiment-four-layer-a' | 'experiment-four-layer-b';
  inspectTarget: 'layer-a-corners' | 'layer-b-corners';
  edgeReflexEnabled: boolean;
  rimSideGapTop: number;
  rimSideGapBottom: number;
  leftLight: number;
  rightLight: number;
};

function edgeBackdropStyle(profile: {
  maskGradient: string;
  tintGradient: string;
  peakAlpha: number;
  colorGain: number;
  rimColor: string;
}): CSSProperties {
  return {
    '--pwzzovO-edge-backdrop-mask': profile.maskGradient,
    '--pwzzovO-edge-backdrop-tint': profile.tintGradient,
    '--pwzzovO-edge-backdrop-peak': String(profile.peakAlpha),
    '--pwzzovO-edge-backdrop-color-gain': String(profile.colorGain),
    '--pwzzovO-edge-rim-color': profile.rimColor,
  } as CSSProperties;
}

export function PwzzovOGlassCorners({
  layerClass,
  inspectTarget,
  edgeReflexEnabled,
  rimSideGapTop,
  rimSideGapBottom,
  leftLight,
  rightLight,
}: PwzzovOGlassCornersProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const backdrop = useEdgeReflexBackdrop(wrapRef, {
    enabled: edgeReflexEnabled,
    gapTop: rimSideGapTop,
    gapBottom: rimSideGapBottom,
    leftLight,
    rightLight,
  });

  return (
    <div ref={wrapRef} className={`${layerClass}__pwzzovO-glass-wrap`} {...e4InspectAttrs(inspectTarget)}>
      {PWZZOV_REFLEX_REGIONS.map((region) => {
        const isEdge = region === 'left' || region === 'right';
        const edgeStyle = isEdge
          ? edgeBackdropStyle(region === 'left' ? backdrop.left : backdrop.right)
          : undefined;

        return (
          <span
            key={region}
            className={`${layerClass}__pwzzovO-glass ${layerClass}__pwzzovO-glass--${region}`}
            style={edgeStyle}
            aria-hidden="true"
          >
            {isEdge && <span className={`${layerClass}__pwzzovO-glass-edge-tint`} aria-hidden="true" />}
          </span>
        );
      })}
    </div>
  );
}
