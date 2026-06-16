import { useRef, type CSSProperties } from 'react';
import { e4InspectAttrs } from '../experiment-set-four/materialSettings';
import {
  useEdgeReflexBackdrop,
} from './useEdgeReflexBackdrop';
import type { CornerReflexBackdropProfile, EdgeReflexBackdropProfile } from './edgeReflexBackdrop';

const PWZZOV_REFLEX_REGIONS = ['tl', 'tr', 'bl', 'br', 'left', 'right'] as const;
const CORNER_REGIONS = ['tl', 'tr', 'bl', 'br'] as const;

type PwzzovOGlassCornersProps = {
  layerClass: 'experiment-four-layer-a' | 'experiment-four-layer-b';
  inspectTarget: 'layer-a-corners' | 'layer-b-corners';
  edgeReflexEnabled: boolean;
  rimSideGapTop: number;
  rimSideGapBottom: number;
  leftLight: number;
  rightLight: number;
  tlLight: number;
  trLight: number;
  blLight: number;
  brLight: number;
};

function edgeBackdropStyle(profile: EdgeReflexBackdropProfile): CSSProperties {
  return {
    '--pwzzovO-edge-backdrop-mask': profile.maskGradient,
    '--pwzzovO-edge-backdrop-rim-mask': profile.rimMaskGradient,
    '--pwzzovO-edge-backdrop-reflex-mask': profile.reflexMaskGradient,
    '--pwzzovO-edge-backdrop-tint': profile.tintGradient,
    '--pwzzovO-edge-backdrop-rim': profile.rimGradient,
    '--pwzzovO-edge-backdrop-peak': String(profile.peakAlpha),
    '--pwzzovO-edge-backdrop-color-gain': String(profile.colorGain),
    '--pwzzovO-edge-rim-color': profile.rimColor,
  } as CSSProperties;
}

function cornerBackdropStyle(profile: CornerReflexBackdropProfile): CSSProperties {
  const colorGain = Math.max(profile.horizontal.colorGain, profile.vertical.colorGain);
  return {
    '--pwzzovO-corner-backdrop-mask-h': profile.horizontal.maskGradient,
    '--pwzzovO-corner-backdrop-rim-mask-h': profile.horizontal.rimMaskGradient,
    '--pwzzovO-corner-backdrop-tint-h': profile.horizontal.tintGradient,
    '--pwzzovO-corner-backdrop-rim-h': profile.horizontal.rimGradient,
    '--pwzzovO-corner-backdrop-mask-v': profile.vertical.maskGradient,
    '--pwzzovO-corner-backdrop-rim-mask-v': profile.vertical.rimMaskGradient,
    '--pwzzovO-corner-backdrop-tint-v': profile.vertical.tintGradient,
    '--pwzzovO-corner-backdrop-rim-v': profile.vertical.rimGradient,
    '--pwzzovO-corner-backdrop-color-gain': String(colorGain),
    '--pwzzovO-edge-rim-color': profile.vertical.rimColor,
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
  tlLight,
  trLight,
  blLight,
  brLight,
}: PwzzovOGlassCornersProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const backdrop = useEdgeReflexBackdrop(wrapRef, {
    enabled: edgeReflexEnabled,
    gapTop: rimSideGapTop,
    gapBottom: rimSideGapBottom,
    leftLight,
    rightLight,
    tlLight,
    trLight,
    blLight,
    brLight,
  });

  return (
    <div ref={wrapRef} className={`${layerClass}__pwzzovO-glass-wrap`} {...e4InspectAttrs(inspectTarget)}>
      {PWZZOV_REFLEX_REGIONS.map((region) => {
        const isEdge = region === 'left' || region === 'right';
        const isCorner = (CORNER_REGIONS as readonly string[]).includes(region);
        const regionStyle = isEdge
          ? edgeBackdropStyle(region === 'left' ? backdrop.left : backdrop.right)
          : isCorner
            ? cornerBackdropStyle(backdrop[region])
            : undefined;

        return (
          <span
            key={region}
            className={`${layerClass}__pwzzovO-glass ${layerClass}__pwzzovO-glass--${region}`}
            style={regionStyle}
            aria-hidden="true"
          >
            {isEdge && (
              <>
                <span className={`${layerClass}__pwzzovO-glass-edge-rim`} aria-hidden="true" />
                <span className={`${layerClass}__pwzzovO-glass-edge-tint`} aria-hidden="true" />
              </>
            )}
            {isCorner && (
              <>
                <span className={`${layerClass}__pwzzovO-glass-corner-rim-h`} aria-hidden="true" />
                <span className={`${layerClass}__pwzzovO-glass-corner-rim-v`} aria-hidden="true" />
                <span className={`${layerClass}__pwzzovO-glass-corner-tint-h`} aria-hidden="true" />
                <span className={`${layerClass}__pwzzovO-glass-corner-tint-v`} aria-hidden="true" />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
