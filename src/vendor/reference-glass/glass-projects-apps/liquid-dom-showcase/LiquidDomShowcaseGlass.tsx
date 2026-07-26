import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  LiquidCanvas,
  ZStack,
} from '@liquid-dom/react';
import { useRef, useState, type CSSProperties } from 'react';
import { getGlassProjectDataAttributes } from '../objectIdentity.ts';
import { LIQUID_DOM_GLASS_PROJECT_PRESETS } from '../presets.ts';
import {
  resolveGlassGeometry,
  type GlassProjectRendererProps,
  type LiquidDomGlassProjectPreset,
} from '../types.ts';
import { useExperimentStageCapture } from '../useExperimentStageCapture.ts';
import styles from './LiquidDomShowcaseGlass.module.css';

export type LiquidDomShowcaseGlassProps = GlassProjectRendererProps &
  Readonly<{
    preset: LiquidDomGlassProjectPreset;
  }>;

function rgba({
  r,
  g,
  b,
  a,
}: LiquidDomGlassProjectPreset['optics']['tint']): string {
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

function getTechnicalInset(preset: LiquidDomGlassProjectPreset): number {
  return Math.ceil(
    Math.max(
      preset.optics.bezelWidth + (preset.optics.displacementBlur ?? 0),
      preset.optics.shadowBlur +
        Math.abs(preset.optics.shadowOffsetY) +
        Math.abs(preset.optics.shadowOffsetX ?? 0) +
        Math.abs(preset.optics.shadowSpread ?? 0),
    ),
  );
}

export function LiquidDomShowcaseGlass({
  preset,
  referencePresetId,
  geometry: geometryOverride,
  className,
  style,
}: LiquidDomShowcaseGlassProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const geometry = resolveGlassGeometry(preset.geometry, geometryOverride);
  const technicalInset = getTechnicalInset(preset);
  const technicalWidth = geometry.width + technicalInset * 2;
  const technicalHeight = geometry.height + technicalInset * 2;
  const capture = useExperimentStageCapture(rootRef, technicalInset);
  const [rendererError, setRendererError] = useState<string | null>(null);
  const opticalInputStyle = capture.dataUrl
    ? ({
        backgroundImage: `url("${capture.dataUrl}")`,
      } satisfies CSSProperties)
    : undefined;
  const renderState = rendererError
    ? 'renderer-error'
    : capture.error
      ? 'capture-error'
      : capture.dataUrl
        ? 'ready'
        : 'capturing-stage';
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      {...getGlassProjectDataAttributes(
        preset,
        geometry,
        referencePresetId,
      )}
      aria-hidden="true"
      className={rootClassName}
      data-render-state={renderState}
      data-renderer-error={rendererError ?? undefined}
      data-stage-capture-error={capture.error ?? undefined}
      data-stage-capture-revision={capture.revision}
      data-shadow-hosting="css-with-source-exact-parameters"
      data-technical-height={technicalHeight}
      data-technical-inset={technicalInset}
      data-technical-width={technicalWidth}
      style={{
        width: geometry.width,
        height: geometry.height,
        borderRadius: geometry.cornerRadius,
        boxShadow: `${preset.optics.shadowOffsetX ?? 0}px ${
          preset.optics.shadowOffsetY
        }px ${preset.optics.shadowBlur}px ${
          preset.optics.shadowSpread ?? 0
        }px ${rgba(preset.optics.shadowColor)}`,
        ...style,
      }}
    >
      <div
        className={styles.clip}
        style={{ borderRadius: geometry.cornerRadius }}
      >
        {capture.dataUrl ? (
          <LiquidCanvas
            className={styles.canvasHost}
            canvasClassName={styles.canvas}
            frameloop="always"
            maxDpr={2}
            proposal={{ width: technicalWidth, height: technicalHeight }}
            style={{
              left: -technicalInset,
              top: -technicalInset,
              width: technicalWidth,
              height: technicalHeight,
            }}
            onError={(error: unknown) => {
              setRendererError(
                error instanceof Error ? error.message : String(error),
              );
            }}
          >
            <ZStack alignment="center">
              <Html zIndex={-2} sizing="fill">
                <div
                  className={styles.opticalInput}
                  data-e11-optical-input="target-stage-capture"
                  style={opticalInputStyle}
                />
              </Html>

              <GlassContainer
                blendSupportGating={preset.optics.blendSupportGating}
                bezelWidth={preset.optics.bezelWidth}
                blur={preset.optics.blur}
                dispersion={preset.optics.dispersion}
                displacementBlur={preset.optics.displacementBlur}
                ior={preset.optics.ior}
                shadowBlur={preset.optics.shadowBlur}
                shadowColor={preset.optics.shadowColor}
                shadowOffsetX={preset.optics.shadowOffsetX}
                shadowOffsetY={preset.optics.shadowOffsetY}
                shadowSpread={preset.optics.shadowSpread}
                spacing={preset.optics.spacing}
                specularFalloff={preset.optics.specularFalloff}
                specularOpacity={preset.optics.specularOpacity}
                thickness={preset.optics.thickness}
                tint={preset.optics.tint}
              >
                <Glass cornerRadius={geometry.cornerRadius}>
                  <Frame width={geometry.width} height={geometry.height} />
                </Glass>
              </GlassContainer>
            </ZStack>
          </LiquidCanvas>
        ) : null}
      </div>
    </div>
  );
}

export function LiquidDomNotificationCenterMainGlass(
  props: GlassProjectRendererProps,
) {
  return (
    <LiquidDomShowcaseGlass
      {...props}
      preset={LIQUID_DOM_GLASS_PROJECT_PRESETS.notificationCenterMain}
    />
  );
}

export function LiquidDomNotificationCenterDockGlass(
  props: GlassProjectRendererProps,
) {
  return (
    <LiquidDomShowcaseGlass
      {...props}
      preset={LIQUID_DOM_GLASS_PROJECT_PRESETS.notificationCenterDock}
    />
  );
}

export function LiquidDomIosNotificationBannerGlass(
  props: GlassProjectRendererProps,
) {
  return (
    <LiquidDomShowcaseGlass
      {...props}
      preset={LIQUID_DOM_GLASS_PROJECT_PRESETS.iosNotificationBanner}
    />
  );
}
