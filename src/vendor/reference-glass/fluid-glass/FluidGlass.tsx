/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-refresh/only-export-components */
import * as THREE from 'three';
import { useRef, useState, useEffect, memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';
import './FluidGlass.css';

export type Mode = 'lens' | 'bar' | 'cube';
export type BackdropMode = 'default' | 'photograph' | 'video';

const ASSET_ROOT = `${import.meta.env.BASE_URL}vendor/reference-glass/fluid-glass`;
const SHARED_PHOTO_URL = `${ASSET_ROOT}/assets/demo/cs1.webp`;
const SHARED_VIDEO_URL = 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4';
const DRACO_DECODER_PATH = `${ASSET_ROOT}/draco/`;
const SOURCE_DEFAULT_FONT_URL = `${ASSET_ROOT}/fonts/noto-sans-latin-400.woff`;

export interface NavItem {
  label: string;
  link: string;
}

export type ModeProps = Record<string, unknown>;

export interface FluidGlassProps {
  mode?: Mode;
  backdrop?: BackdropMode;
  lensProps?: ModeProps;
  barProps?: ModeProps;
  cubeProps?: ModeProps;
}

export default function FluidGlass({
  mode = 'lens',
  backdrop = 'default',
  lensProps = {},
  barProps = {},
  cubeProps = {}
}: FluidGlassProps) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems as NavItem[]} />}
        <Wrapper modeProps={modeProps}>
          {backdrop === 'default' ? (
            <Scroll>
              <Typography />
              <Images />
            </Scroll>
          ) : (
            <SharedMediaScene backdrop={backdrop} />
          )}
          {/*
           * The source includes an empty <Scroll html />. It has no rendered
           * children or visual behavior, but drei implements it by calling
           * ReactDOMClient.createRoot() during render. React StrictMode then
           * creates two roots for the same fixed container. Omitting this
           * empty portal preserves the rendered source output while allowing
           * deterministic mount/unmount/reselection.
           */}
          <Preload />
        </Wrapper>
      </ScrollControls>
    </Canvas>
  );
}

function SharedMediaScene({ backdrop }: { backdrop: Exclude<BackdropMode, 'default'> }) {
  const tex = useSharedMediaTexture(backdrop);
  const { viewport } = useThree();

  if (!tex) return null;

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function useSharedMediaTexture(backdrop: Exclude<BackdropMode, 'default'>) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let video: HTMLVideoElement | null = null;
    let tex: THREE.Texture;

    if (backdrop === 'video') {
      video = document.createElement('video');
      video.src = SHARED_VIDEO_URL;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      void video.play().catch(() => undefined);
      tex = new THREE.VideoTexture(video);
    } else {
      tex = new THREE.TextureLoader().load(SHARED_PHOTO_URL);
    }

    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    setTexture(tex);

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      tex.dispose();
    };
  }, [backdrop]);

  return texture;
}

type MeshProps = ThreeElements['mesh'];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
}

interface ZoomMaterial extends THREE.Material {
  zoom: number;
}

type ZoomMesh = THREE.Mesh<THREE.BufferGeometry, ZoomMaterial>;

type ZoomGroup = THREE.Group & { children: ZoomMesh[] };

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  // Import-path-only source adaptation: the authoritative GLBs are still
  // decoded by drei, but the decoder is vendored so production has no CDN
  // dependency.
  const { nodes } = useGLTF(glb, DRACO_DECODER_PATH);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  useEffect(() => {
    const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if ((modeProps as { scale?: number }).scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x5227ff, 1);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    [key: string]: unknown;
  };

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...(typeof extraMat === 'object' && extraMat !== null ? extraMat : {})}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return (
    <ModeWrapper
      glb={`${ASSET_ROOT}/assets/3d/lens.glb`}
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return (
    <ModeWrapper
      glb={`${ASSET_ROOT}/assets/3d/cube.glb`}
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  );
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb={`${ASSET_ROOT}/assets/3d/bar.glb`}
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }: { items: NavItem[] }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.045 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.045 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.cursor = 'auto';
    };
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link: string) => {
    if (!link) return;
    window.location.assign(link);
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          font={SOURCE_DEFAULT_FONT_URL}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef<ZoomGroup>(null!);
  const data = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[4].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1]} url={`${ASSET_ROOT}/assets/demo/cs1.webp`} />
      <Image position={[2, 0, 3]} scale={3} url={`${ASSET_ROOT}/assets/demo/cs2.webp`} />
      <Image position={[-2.05, -height, 6]} scale={[1, 3]} url={`${ASSET_ROOT}/assets/demo/cs3.webp`} />
      <Image position={[-0.6, -height, 9]} scale={[1, 2]} url={`${ASSET_ROOT}/assets/demo/cs1.webp`} />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url={`${ASSET_ROOT}/assets/demo/cs2.webp`} />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState<keyof typeof DEVICE>(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      font={SOURCE_DEFAULT_FONT_URL}
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      React Bits
    </Text>
  );
}

export const FLUID_GLASS_NATIVE_LAYOUT = {
  width: 320,
  height: 240,
  radius: 10
} as const;

export const FLUID_GLASS_RUNTIME_ASSETS = {
  lens: `${ASSET_ROOT}/assets/3d/lens.glb`,
  bar: `${ASSET_ROOT}/assets/3d/bar.glb`,
  cube: `${ASSET_ROOT}/assets/3d/cube.glb`,
  backdropOne: `${ASSET_ROOT}/assets/demo/cs1.webp`,
  backdropTwo: `${ASSET_ROOT}/assets/demo/cs2.webp`,
  backdropThree: `${ASSET_ROOT}/assets/demo/cs3.webp`,
  dracoDecoder: `${DRACO_DECODER_PATH}draco_decoder.js`,
  dracoWasm: `${DRACO_DECODER_PATH}draco_decoder.wasm`,
  dracoWasmWrapper: `${DRACO_DECODER_PATH}draco_wasm_wrapper.js`,
  sourceDefaultFont: SOURCE_DEFAULT_FONT_URL
} as const;

export interface FluidGlassReferenceRendererProps {
  presetId: string;
  sourcePresetKey: string;
  mode: Mode;
  config: ModeProps;
  className?: string;
  style?: CSSProperties;
}

/**
 * Native gallery-stage adapter. The 320×240 stage is the exact live area used
 * for each authoritative gallery card; the underlying FluidGlass implementation
 * remains one renderer shared by all five requested presets.
 */
export function FluidGlassReferenceRenderer({
  presetId,
  sourcePresetKey,
  mode,
  config,
  className = '',
  style
}: FluidGlassReferenceRendererProps) {
  return (
    <div
      className={`e11-ref-fluid-glass-stage ${className}`.trim()}
      style={style}
      data-e11-reference-family="fluid-glass"
      data-e11-reference-preset={presetId}
      data-source-preset-key={sourcePresetKey}
      data-fluid-glass-mode={mode}
      data-fluid-glass-glb={FLUID_GLASS_RUNTIME_ASSETS[mode]}
      data-fluid-glass-geometry-key={mode === 'lens' ? 'Cylinder' : 'Cube'}
      data-fluid-glass-config={JSON.stringify(config)}
      data-native-width={FLUID_GLASS_NATIVE_LAYOUT.width}
      data-native-height={FLUID_GLASS_NATIVE_LAYOUT.height}
      data-native-radius={FLUID_GLASS_NATIVE_LAYOUT.radius}
    >
      <FluidGlass
        mode={mode}
        lensProps={mode === 'lens' ? config : {}}
        barProps={mode === 'bar' ? config : {}}
        cubeProps={mode === 'cube' ? config : {}}
      />
    </div>
  );
}
