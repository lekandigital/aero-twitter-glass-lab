import { useRef, type CSSProperties } from 'react';
import { e4InspectAttrs } from '../experiment-set-four/materialSettings';
import { useEdgeReflexBackdrop, type EdgeReflexBackdropProfiles } from './useEdgeReflexBackdrop';
import type { EdgeReflexBackdropProfile } from './edgeReflexBackdrop';

const PWZZOV_CORNER_REGIONS = ['tl', 'tr', 'bl', 'br'] as const;
const PWZZOV_LINEAR_EDGE_REGIONS = ['top', 'bottom', 'left', 'right'] as const;
const PWZZOV_REFLEX_REGIONS = [...PWZZOV_CORNER_REGIONS, ...PWZZOV_LINEAR_EDGE_REGIONS] as const;

type PwzzovLinearEdgeRegion = (typeof PWZZOV_LINEAR_EDGE_REGIONS)[number];

export type PwzzovBackdropLightSettings = {
  tlLight: number;
  trLight: number;
  blLight: number;
  brLight: number;
  topLight: number;
  bottomLight: number;
  leftLight: number;
  rightLight: number;
};

type PwzzovOGlassCornersProps = {
  layerClass: 'experiment-four-layer-a' | 'experiment-four-layer-b';
  inspectTarget: 'layer-a-corners' | 'layer-b-corners';
  edgeReflexEnabled: boolean;
  rimSideGapTop: number;
  rimSideGapBottom: number;
  backdropLights: PwzzovBackdropLightSettings;
};

const BACKDROP_VISIBLE_PEAK = 0.04;

function edgeBackdropStyle(profile: EdgeReflexBackdropProfile): CSSProperties {
  return {
    '--pwzzovO-edge-backdrop-mask': profile.maskGradient,
    '--pwzzovO-edge-backdrop-rim-mask': profile.rimMaskGradient,
    '--pwzzovO-edge-backdrop-tint': profile.tintGradient,
    '--pwzzovO-edge-backdrop-rim': profile.rimGradient,
    '--pwzzovO-edge-backdrop-peak': String(profile.peakAlpha),
    '--pwzzovO-edge-backdrop-color-gain': String(profile.colorGain),
    '--pwzzovO-edge-rim-color': profile.rimColor,
  } as CSSProperties;
}

function edgeReflexMaskStyle(profile: EdgeReflexBackdropProfile): CSSProperties {
  return {
    '--pwzzovO-edge-backdrop-reflex-mask': profile.reflexMaskGradient,
    '--pwzzovO-edge-backdrop-peak': String(profile.peakAlpha),
    '--pwzzovO-edge-backdrop-color-gain': String(profile.colorGain),
  } as CSSProperties;
}

function profileForLinearEdge(
  region: PwzzovLinearEdgeRegion,
  backdrop: EdgeReflexBackdropProfiles,
): EdgeReflexBackdropProfile {
  return backdrop[region];
}

function backdropIsVisible(profile: EdgeReflexBackdropProfile): boolean {
  return profile.peakAlpha > BACKDROP_VISIBLE_PEAK && profile.colorGain > 0;
}

export function pwzzovBackdropReflexEnabled(mode: number, reflexValues: number[]): boolean {
  if (mode !== 3) return false;
  return reflexValues.some((value) => value > 0);
}

export function PwzzovOGlassCorners({
  layerClass,
  inspectTarget,
  edgeReflexEnabled,
  backdropLights,
}: PwzzovOGlassCornersProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const backdrop = useEdgeReflexBackdrop(wrapRef, {
    enabled: edgeReflexEnabled,
    topLight: backdropLights.topLight,
    bottomLight: backdropLights.bottomLight,
    leftLight: backdropLights.leftLight,
    rightLight: backdropLights.rightLight,
  });

  return (
    <div ref={wrapRef} className={`${layerClass}__pwzzovO-glass-wrap`} {...e4InspectAttrs(inspectTarget)}>
      {PWZZOV_REFLEX_REGIONS.map((region) => {
        const isLinearEdge = PWZZOV_LINEAR_EDGE_REGIONS.includes(region as PwzzovLinearEdgeRegion);
        const profile = isLinearEdge ? profileForLinearEdge(region as PwzzovLinearEdgeRegion, backdrop) : null;
        const showReflexMask = profile !== null && backdropIsVisible(profile);

        return (
          <span
            key={region}
            className={`${layerClass}__pwzzovO-glass ${layerClass}__pwzzovO-glass--${region}`}
            style={showReflexMask && profile ? edgeReflexMaskStyle(profile) : undefined}
            aria-hidden="true"
          />
        );
      })}

      <div className={`${layerClass}__pwzzovO-backdrop-band`} aria-hidden="true">
        {PWZZOV_LINEAR_EDGE_REGIONS.map((region) => {
          const profile = profileForLinearEdge(region, backdrop);
          if (!backdropIsVisible(profile)) return null;

          return (
            <span
              key={`backdrop-${region}`}
              className={`${layerClass}__pwzzovO-backdrop-edge ${layerClass}__pwzzovO-backdrop-edge--${region}`}
              style={edgeBackdropStyle(profile)}
            >
              <span className={`${layerClass}__pwzzovO-glass-edge-rim`} aria-hidden="true" />
              <span className={`${layerClass}__pwzzovO-glass-edge-tint`} aria-hidden="true" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
