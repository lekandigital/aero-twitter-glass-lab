import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowUp } from 'lucide-react';
import { useMotionValue, useSpring } from 'motion/react';
import html2canvas from 'html2canvas';
import {
  LiquidGlass,
  type LiquidGlassHandle,
} from '../../../vendor/reference-glass/liquid-glass-web-react';
import { SourceLiquidGlass } from '../../../vendor/reference-glass/web-glass-effect/SourceLiquidGlass';
import { LiquidFilter } from '../../../vendor/web-glass-effect/motion/liquid/filter';
import { CONVEX } from '../../../vendor/web-glass-effect/motion/liquid/liquid-lib';
import { adaptLiquidGlassJsContainerSource } from './liquidGlassJsSourceAdapter';
import type { ButtonRendererProps } from './sourceCss';
import exactContainerSource from '../../../../_reference_vault/reference-library/github/liquid-glass-js/container.js?raw';
import exactButtonSource from '../../../../_reference_vault/reference-library/github/liquid-glass-js/button.js?raw';

const TOGGLE_LENS_WIDTH = 86;
const TOGGLE_REST_GLASS = { strength: 0.02, chromaticAberration: 0.25 };
const TOGGLE_DRAG_GLASS = { strength: 0.042, chromaticAberration: 0.65 };

export function LiquidWebToggleButton() {
  const [checked, setChecked] = useState(true);
  const lensRef = useRef<LiquidGlassHandle>(null);
  const fxRef = useRef({ raf: 0, ...TOGGLE_REST_GLASS });

  const animateGlass = (target: typeof TOGGLE_REST_GLASS | typeof TOGGLE_DRAG_GLASS) => {
    const fx = fxRef.current;
    cancelAnimationFrame(fx.raf);
    const tick = () => {
      fx.strength += (target.strength - fx.strength) * 0.18;
      fx.chromaticAberration +=
        (target.chromaticAberration - fx.chromaticAberration) * 0.18;
      const settled =
        Math.abs(target.strength - fx.strength) < 0.0005 &&
        Math.abs(target.chromaticAberration - fx.chromaticAberration) < 0.005;
      if (settled) {
        fx.strength = target.strength;
        fx.chromaticAberration = target.chromaticAberration;
      }
      lensRef.current?.engine?.setOptions({
        strength: fx.strength,
        chromaticAberration: fx.chromaticAberration,
      });
      if (!settled) fx.raf = requestAnimationFrame(tick);
    };
    fx.raf = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(fxRef.current.raf), []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = lensRef.current?.element;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / rect.width;
    const halfLens = TOGGLE_LENS_WIDTH / 2 / rect.width;
    if (Math.abs(pointerX - 0.5) > halfLens) return;
    animateGlass(TOGGLE_DRAG_GLASS);
  };

  const handlePointerEnd = () => animateGlass(TOGGLE_REST_GLASS);

  const toggle = (
    <div className="toggle button-src-liquid-toggle__bar">
      <button type="button" aria-pressed={checked} onClick={() => setChecked((value) => !value)}>
        Hubs
      </button>
    </div>
  );

  return (
    <div
      className="toggleWrap button-src-liquid-toggle-wrap"
      data-isolated-toggle-state={checked ? 'checked' : 'unchecked'}
      data-lens-present={checked ? 'true' : 'false'}
    >
      {checked ? (
        <LiquidGlass
          ref={lensRef}
          y={0.5}
          width={TOGGLE_LENS_WIDTH}
          height={46}
          strength={TOGGLE_REST_GLASS.strength}
          chromaticAberration={TOGGLE_REST_GLASS.chromaticAberration}
          curvature={0.85}
          depth={8}
          glow={0.15}
          edgeHighlight={0.35}
          shadow="0 0 0 1px rgba(255,255,255,0.14), 0 4px 14px rgba(0,0,0,0.45)"
          style={{ touchAction: 'none' }}
          className="button-src-liquid-toggle"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        >
          {toggle}
        </LiquidGlass>
      ) : (
        <div className="button-src-liquid-toggle__unchecked">{toggle}</div>
      )}
    </div>
  );
}

export function WgeNextButton() {
  const blur = useSpring(0, { stiffness: 300, damping: 30 });
  const refractiveIndex = useSpring(1.4, { stiffness: 300, damping: 30 });
  const setHover = (hovered: boolean) => {
    blur.set(hovered ? 1.5 : 0);
    refractiveIndex.set(hovered ? 3 : 1.4);
  };
  return (
    <SourceLiquidGlass
      glassThickness={110}
      bezelWidth={20}
      blur={blur}
      refractiveIndex={refractiveIndex}
      specularOpacity={0.9}
      className="button-src-wge"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ArrowUp aria-hidden="true" />
    </SourceLiquidGlass>
  );
}

export function WebGlassNavButton({ preset }: ButtonRendererProps) {
  const hovered = preset.sourceState === 'hovered';
  const filterId = `button-exp-web-glass-${preset.id}-${useId()}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-',
  );
  const scaleRatio = useMotionValue(1);

  useEffect(() => {
    scaleRatio.set(1);
  }, [scaleRatio]);

  return (
    <>
      <LiquidFilter
        id={filterId}
        width={52}
        height={52}
        radius={26}
        canvasWidth={52}
        canvasHeight={52}
        glassThickness={110}
        bezelWidth={20}
        refractiveIndex={hovered ? 3 : 1.4}
        blur={hovered ? 1.5 : 0}
        specularOpacity={0.9}
        specularSaturation={4}
        bezelHeightFn={CONVEX.fn}
        scaleRatio={scaleRatio}
        dpr={1}
      />
      <div
        className="button-src-web-glass"
        data-source-config={hovered ? 'PRESETS.navButtonHover' : 'PRESETS.navButton'}
        data-source-refractive-index={hovered ? '3' : '1.4'}
        data-source-blur={hovered ? '1.5' : '0'}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
          boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
        }}
      />
    </>
  );
}

export function Ios26FilteredButton({ preset }: ButtonRendererProps) {
  const filterId = `button-exp-ios26-${preset.id.replace(/[^a-zA-Z0-9_-]/g, '-')}-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const filterStyle = {
    '--button-ios26-filter': `url(#${filterId})`,
  } as CSSProperties;

  return (
    <>
      <button
        type="button"
        className="button-src-ios26"
        aria-label={preset.label}
        style={filterStyle}
        data-source-filter-map-sha256="0dab2624648a6d2cae916e832055a21a3f205cb78182ac1d857509e739639de2"
      >
        <svg
          className="button-src-ios26__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
      <svg className="button-src-ios26__defs" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={filterId} primitiveUnits="objectBoundingBox">
            <feImage
              href={`${import.meta.env.BASE_URL}vendor/reference-glass/liquid-glass-dist/frosted-map.png`}
              x="0"
              y="0"
              width="1"
              height="1"
              result="map"
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
            <feDisplacementMap
              id={`${filterId}-disp`}
              in="blur"
              in2="map"
              scale="1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

type ExactGlassInstance = {
  element: HTMLDivElement;
  canvas: HTMLCanvasElement;
  gl_refs: {
    gl?: WebGLRenderingContext;
    texture?: WebGLTexture;
    positionBuffer?: WebGLBuffer;
    texcoordBuffer?: WebGLBuffer;
  };
  gl?: WebGLRenderingContext;
  webglInitialized: boolean;
  __buttonExperimentHandleScroll?: EventListener;
  __buttonExperimentDestroyed?: boolean;
};

type ExactGlassClass = {
  new (options?: Record<string, unknown>): ExactGlassInstance;
  instances: ExactGlassInstance[];
  waitingForSnapshot: ExactGlassInstance[];
};

type ExactGlassRuntime = {
  Container: ExactGlassClass & {
    pageSnapshot: HTMLCanvasElement | null;
    isCapturing: boolean;
  };
  Button: ExactGlassClass;
};

/*
 * The checked-in vault files are byte-identical to glass-projects-lab at the
 * audited commit. These compatibility patches expose the private scroll
 * listener, guard callbacks after unmount, avoid retaining a page snapshot
 * when every waiting source instance was removed, and keep the source's native
 * layout size when the experiment stage applies an outer CSS transform.
 * Source defaults, geometry, shader text, uniforms, and drawing stay unchanged.
 */
const lifecycleAwareContainerSource =
  adaptLiquidGlassJsContainerSource(exactContainerSource);

const exactGlassRuntimeFactory = new Function(
  'html2canvas',
  `"use strict";\n${lifecycleAwareContainerSource}\n${exactButtonSource}\nreturn { Container, Button };`,
) as (html2canvasImplementation: typeof html2canvas) => ExactGlassRuntime;

const EXACT_GLASS_RUNTIME = exactGlassRuntimeFactory(html2canvas);

function destroyExactGlassInstance(instance: ExactGlassInstance) {
  instance.__buttonExperimentDestroyed = true;
  if (instance.__buttonExperimentHandleScroll) {
    window.removeEventListener('scroll', instance.__buttonExperimentHandleScroll);
  }
  const gl = instance.gl_refs.gl;
  if (gl) {
    if (instance.gl_refs.texture) gl.deleteTexture(instance.gl_refs.texture);
    if (instance.gl_refs.positionBuffer) gl.deleteBuffer(instance.gl_refs.positionBuffer);
    if (instance.gl_refs.texcoordBuffer) gl.deleteBuffer(instance.gl_refs.texcoordBuffer);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  instance.gl_refs = {};
  instance.gl = undefined;
  instance.webglInitialized = false;
  EXACT_GLASS_RUNTIME.Container.instances = EXACT_GLASS_RUNTIME.Container.instances.filter(
    (candidate) => candidate !== instance,
  );
  EXACT_GLASS_RUNTIME.Container.waitingForSnapshot =
    EXACT_GLASS_RUNTIME.Container.waitingForSnapshot.filter(
      (candidate) => candidate !== instance,
    );
  if (EXACT_GLASS_RUNTIME.Container.instances.length === 0) {
    const snapshot = EXACT_GLASS_RUNTIME.Container.pageSnapshot;
    if (snapshot) {
      snapshot.width = 0;
      snapshot.height = 0;
    }
    EXACT_GLASS_RUNTIME.Container.pageSnapshot = null;
  }
  instance.element.remove();
}

export function LiquidGlassJsButton({ preset }: ButtonRendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const instance = new EXACT_GLASS_RUNTIME.Button({
      text: '▶',
      size: '32',
      type: 'circle',
      warp: false,
      tintOpacity: 0.2,
      onClick: () => undefined,
    });
    host.replaceChildren(instance.element);
    return () => destroyExactGlassInstance(instance);
  }, []);

  return (
    <div
      ref={hostRef}
      className="button-src-liquid-js-host"
      role="button"
      aria-label={preset.label}
      data-exact-source-runtime="liquid-glass-js/container.js+button.js"
      data-exact-source-lifecycle="listener-removal async-guard snapshot-release webgl-release"
    />
  );
}
