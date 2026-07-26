import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export interface PureCssIos26ContainerConfig {
  width: number;
  height: number;
  radius: number;
  backdropBlur: number;
  noiseBaseFrequencyX: number;
  noiseBaseFrequencyY: number;
  noiseOctaves: number;
  noiseSeed: number;
  noiseBlur: number;
  displacementScale: number;
}

export const PURE_CSS_IOS_26_CONTAINER_NATIVE_GEOMETRY = {
  width: 300,
  height: 200,
  radius: 30,
  boxModel: 'border-box',
} as const satisfies ReferenceObjectGeometry;

export const PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG = {
  width: PURE_CSS_IOS_26_CONTAINER_NATIVE_GEOMETRY.width,
  height: PURE_CSS_IOS_26_CONTAINER_NATIVE_GEOMETRY.height,
  radius: PURE_CSS_IOS_26_CONTAINER_NATIVE_GEOMETRY.radius,
  backdropBlur: 0,
  noiseBaseFrequencyX: 0.008,
  noiseBaseFrequencyY: 0.008,
  noiseOctaves: 2,
  noiseSeed: 92,
  noiseBlur: 0.02,
  displacementScale: 77,
} as const satisfies PureCssIos26ContainerConfig;

export function createPureCssIos26ContainerGeometry(
  width: number,
  height: number,
  radius: number,
): PureCssIos26ContainerConfig {
  return {
    ...PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
    width,
    height,
    radius,
  };
}

export const PURE_CSS_IOS_26_CONTAINER_CONTRACT = {
  key: 'pure-css-ios-26:.glassContainer',
  nativeGeometry: PURE_CSS_IOS_26_CONTAINER_NATIVE_GEOMETRY,
  defaultConfig: PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'pure-css-ios-26',
    sourceComponent: 'pure-css-ios-26-liquid-glass-effect .glassContainer',
    sourceSelector: '.glassContainer',
    localAdaptedPath:
      'src/vendor/reference-glass/pure-css-ios-26/PureCssIos26GlassContainer.tsx',
    renderer: 'css-pseudo-svg-turbulence-displacement',
    sourceFiles: [
      {
        path: 'pure-css-ios-26-liquid-glass-effect/dist/index.html',
        sha256:
          '1e380e49065b82d7cb56e61bce75f51daa936e39f51baa6b718b929d695986d2',
        role: 'authoritative SVG filter graph and object DOM',
      },
      {
        path: 'pure-css-ios-26-liquid-glass-effect/dist/style.css',
        sha256:
          '0ee729b1c036472b4c7da4dbae12ef4bd10e2141890beeb38ac820d1cf12eeab',
        role: 'authoritative container and pseudo-element appearance',
      },
    ],
    omittedVisibleContent: [
      'nested .glassBtn',
      'button plus icon',
      'button-specific embedded displacement map',
      'animated source flower wallpaper',
    ],
    intentionalAdaptations: [
      'source filter id is collision-scoped per React mount',
      'source fixed positioning is delegated to the Layer C portal',
      'container and both pseudo radii share explicit geometry inputs for resized variants',
    ],
  },
} as const satisfies ReferenceObjectContract<PureCssIos26ContainerConfig>;
