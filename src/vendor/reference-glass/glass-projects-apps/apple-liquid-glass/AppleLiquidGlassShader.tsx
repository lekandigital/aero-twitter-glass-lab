import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import {
  CanvasTexture,
  Vector2,
  type IUniform,
  type ShaderMaterialParameters,
} from 'three';
import { getGlassProjectDataAttributes } from '../objectIdentity.ts';
import { APPLE_LIQUID_GLASS_SHADER_PRESET } from '../presets.ts';
import {
  resolveGlassGeometry,
  type GlassGeometry,
  type GlassProjectRendererProps,
} from '../types.ts';
import { useExperimentStageCapture } from '../useExperimentStageCapture.ts';
import {
  APPLE_LIQUID_GLASS_FRAGMENT_SHADER,
  APPLE_LIQUID_GLASS_SHADER_PARAMETERS,
  APPLE_LIQUID_GLASS_VERTEX_SHADER,
} from './appleShaderSource.ts';
import styles from './AppleLiquidGlassShader.module.css';

type AppleShaderUniforms = Readonly<{
  uMouse: IUniform<Vector2>;
  uRes: IUniform<Vector2>;
  uTexRes: IUniform<Vector2>;
  uGlassCoreHalfSize: IUniform<Vector2>;
  uGlassRadius: IUniform<number>;
  uTexture: IUniform<CanvasTexture>;
}>;

function AppleLiquidGlassMesh({
  captureCanvas,
  geometry,
}: Readonly<{
  captureCanvas: HTMLCanvasElement;
  geometry: GlassGeometry;
}>) {
  const technicalInset = geometry.technicalInset ?? 0;
  const technicalWidth = geometry.width + technicalInset * 2;
  const technicalHeight = geometry.height + technicalInset * 2;
  const texture = useMemo(
    () => new CanvasTexture(captureCanvas),
    [captureCanvas],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  const shader = useMemo(() => {
    const uniforms: AppleShaderUniforms = {
      uMouse: { value: new Vector2(0, 0) },
      uRes: { value: new Vector2(technicalWidth, technicalHeight) },
      uTexRes: {
        value: new Vector2(captureCanvas.width, captureCanvas.height),
      },
      uGlassCoreHalfSize: {
        value: new Vector2(
          Math.max(0, geometry.width / 2 - geometry.cornerRadius),
          Math.max(0, geometry.height / 2 - geometry.cornerRadius),
        ),
      },
      uGlassRadius: { value: geometry.cornerRadius },
      uTexture: { value: texture },
    };

    return {
      uniforms,
      vertexShader: APPLE_LIQUID_GLASS_VERTEX_SHADER,
      fragmentShader: APPLE_LIQUID_GLASS_FRAGMENT_SHADER,
    } satisfies ShaderMaterialParameters;
  }, [
    captureCanvas.height,
    captureCanvas.width,
    geometry.cornerRadius,
    geometry.height,
    geometry.width,
    technicalHeight,
    technicalWidth,
    texture,
  ]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        args={[shader]}
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}

export function AppleLiquidGlassShader({
  referencePresetId,
  geometry: geometryOverride,
  className,
  style,
}: GlassProjectRendererProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const geometry = resolveGlassGeometry(
    APPLE_LIQUID_GLASS_SHADER_PRESET.geometry,
    geometryOverride,
  );
  const technicalInset = geometry.technicalInset ?? 0;
  const capture = useExperimentStageCapture(rootRef, technicalInset);
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const canvasStyle = {
    left: -technicalInset,
    top: -technicalInset,
    width: geometry.width + technicalInset * 2,
    height: geometry.height + technicalInset * 2,
  } satisfies CSSProperties;

  return (
    <div
      ref={rootRef}
      {...getGlassProjectDataAttributes(
        APPLE_LIQUID_GLASS_SHADER_PRESET,
        geometry,
        referencePresetId,
      )}
      aria-hidden="true"
      className={rootClassName}
      data-flower-contribution="removed"
      data-pointer-follow="disabled"
      data-render-state={
        capture.error
          ? 'capture-error'
          : capture.canvas
            ? 'ready'
            : 'capturing-stage'
      }
      data-shader-blur-size={
        APPLE_LIQUID_GLASS_SHADER_PARAMETERS.blurSizePx
      }
      data-shader-direction-samples={
        APPLE_LIQUID_GLASS_SHADER_PARAMETERS.directionSamples
      }
      data-shader-quality-samples={
        APPLE_LIQUID_GLASS_SHADER_PARAMETERS.qualitySamples
      }
      data-stage-capture-error={capture.error ?? undefined}
      data-stage-capture-revision={capture.revision}
      data-technical-height={geometry.height + technicalInset * 2}
      data-technical-inset={technicalInset}
      data-technical-width={geometry.width + technicalInset * 2}
      style={{
        width: geometry.width,
        height: geometry.height,
        ...style,
      }}
    >
      {capture.canvas ? (
        <div className={styles.canvasShell} style={canvasStyle}>
          <Canvas
            dpr={[1, 1]}
            frameloop="always"
            gl={{ alpha: true }}
          >
            <AppleLiquidGlassMesh
              captureCanvas={capture.canvas}
              geometry={geometry}
            />
          </Canvas>
        </div>
      ) : null}
    </div>
  );
}
