import { useRef, type CSSProperties } from 'react';
import { e4InspectAttrs } from '../experiment-set-four/materialSettings';
import { useEdgeReflexBackdrop } from './useEdgeReflexBackdrop';
import type { EdgeReflexBackdropProfile } from './edgeReflexBackdrop';

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

function edgeSpotStyle(profile: EdgeReflexBackdropProfile): CSSProperties | undefined {
  if (!profile.spotMaskImage) return undefined;

  return {
    '--pwzzovO-edge-spot-mask': `url(${profile.spotMaskImage})`,
    '--pwzzovO-edge-backdrop-color-gain': String(profile.colorGain),
    '--pwzzovO-edge-backdrop-peak': String(profile.peakAlpha),
  } as CSSProperties;
}

function edgeTintStyle(profile: EdgeReflexBackdropProfile): CSSProperties | undefined {
  if (!profile.tintImage) return undefined;

  return {
    backgroundImage: `url(${profile.tintImage})`,
  };
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
        const profile = isEdge ? (region === 'left' ? backdrop.left : backdrop.right) : null;
        const hasSpots = Boolean(profile?.spotMaskImage);

        return (
          <span
            key={region}
            className={`${layerClass}__pwzzovO-glass ${layerClass}__pwzzovO-glass--${region}${hasSpots ? ` ${layerClass}__pwzzovO-glass--backdrop-spots` : ''}`}
            style={hasSpots && profile ? edgeSpotStyle(profile) : undefined}
            aria-hidden="true"
          >
            {isEdge && profile && (
              <span
                className={`${layerClass}__pwzzovO-glass-edge-tint${profile.tintImage ? ` ${layerClass}__pwzzovO-glass-edge-tint--active` : ''}`}
                style={edgeTintStyle(profile)}
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
