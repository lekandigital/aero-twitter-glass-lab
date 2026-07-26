import type {
  CssSvgGlassProjectPreset,
  GlassProjectObjectId,
  GlassProjectPreset,
  LiquidDomGlassProjectPreset,
  ShaderGlassProjectPreset,
  SourceProvenance,
} from './types.ts';
import { APPLE_LIQUID_GLASS_SHADER_PARAMETERS } from './apple-liquid-glass/appleShaderSource.ts';

const REPOSITORY_COMMIT = '49b76e9f67870721bf6c4c02dfb792704b0a635e';

const notificationCenterProvenance = {
  repository: 'glass-projects-lab',
  repositoryCommit: REPOSITORY_COMMIT,
  projectDirectory: 'liquid-dom-master/demo/showcase',
  deploymentProjectId: 'prj_x0xysD23LZFtu4c6qgHVmn8glgO8',
  sourceComponent: 'NotificationCenterDemo',
  sourceFiles: [
    {
      path: 'liquid-dom-master/demo/showcase/src/demos/NotificationCenterDemo.tsx',
      sha256:
        '8b6d30eb631e81d8480b21a913632f1d79d6cec7a52e2cad6022de789a2df266',
      sourceLines: '294-383',
    },
    {
      path: 'liquid-dom-master/demo/showcase/src/demos/NotificationCenterDemo.module.css',
      sha256:
        '1b66eeb9df006e0f358c66dadef89b737366fa0f506a11d6c47dcf140d425458',
    },
  ],
  combinedSha256:
    '74cf959590c24e84c52cfffe8c1188da87740438e1c07ba1f48a2bf6ab932bc7',
  auditedSourceState: 'clean',
} as const satisfies SourceProvenance;

const iosNotificationProvenance = {
  repository: 'glass-projects-lab',
  repositoryCommit: REPOSITORY_COMMIT,
  projectDirectory: 'liquid-dom-master/demo/showcase',
  deploymentProjectId: 'prj_x0xysD23LZFtu4c6qgHVmn8glgO8',
  sourceComponent: 'IosNotificationDemo',
  sourceFiles: [
    {
      path: 'liquid-dom-master/demo/showcase/src/demos/IosNotificationDemo.tsx',
      sha256:
        '95fb41d4bb62e259d83cf1e538e6a289e3a430ac4bf60c2c4b317f7174116875',
      sourceLines: '238-280',
    },
    {
      path: 'liquid-dom-master/demo/showcase/src/demos/IosNotificationDemo.module.css',
      sha256:
        '51aa7c938b30ae4b7f5677606c617b00c67a9d691fa91b44b6e1c3486a4c7df0',
    },
  ],
  combinedSha256:
    '4f38997d7994da0a4dbc78273e2c910fba692edb814581d178da2c2ca820b30a',
  auditedSourceState: 'clean',
} as const satisfies SourceProvenance;

const lucasRomeroProvenance = {
  repository: 'glass-projects-lab',
  repositoryCommit: REPOSITORY_COMMIT,
  projectDirectory:
    'apple-liquid-glass-from-lucasromerodb-liquid-glass-effect-macos',
  deploymentProjectId: 'prj_fxNWsn19GSTIzIow8tJJ5rJWexT8',
  sourceComponent: 'liquidGlass-wrapper dock',
  sourceFiles: [
    {
      path: 'apple-liquid-glass-from-lucasromerodb-liquid-glass-effect-macos/src/index.html',
      sha256:
        '41d145959b876436913c6ef5f3e6f08d5cc113cbb2bae5ef0bfea999efed69c2',
      sourceLines: '1-84',
    },
    {
      path: 'apple-liquid-glass-from-lucasromerodb-liquid-glass-effect-macos/src/style.css',
      sha256:
        '12cfac2a1c223ac56c4fb6b558faa17b2ba06350854b81c1a6624609e07db799',
      sourceLines: '1-32, 92-114',
    },
  ],
  combinedSha256:
    '91b9a85649aaa4d7094f79f2cb90ff8d0585aed146a8aae7718cc8db893608be',
  auditedSourceState: 'clean',
} as const satisfies SourceProvenance;

const appleShaderProvenance = {
  repository: 'glass-projects-lab',
  repositoryCommit: REPOSITORY_COMMIT,
  projectDirectory: 'apple-liquid-glass',
  deploymentProjectId: 'prj_MvdbM3YyKQJ4ZuZ7ZkoCBmX7JrGR',
  sourceComponent: 'LiquidGlass',
  sourceFiles: [
    {
      path: 'apple-liquid-glass/src/index.html',
      sha256:
        '62ce2d22900ca7d7c889d990dab0de13162e6f94caa99d1150d5128d5967bdd4',
    },
    {
      path: 'apple-liquid-glass/src/style.css',
      sha256:
        '36ed46ee2cb957adc02aa543bc52390d05762785a3a837bb378f558a52f51a49',
    },
    {
      path: 'apple-liquid-glass/src/script.js',
      sha256:
        '705299de2b2618fbefb20a1bf0b30c531abf7d4ff29eea2941c890195e9439f8',
      sourceLines: '10-145',
    },
  ],
  combinedSha256:
    'e69a5ef6767a16e49289603975042d8a34caef78df043264d8d23477c01f292f',
  auditedSourceState: 'clean',
} as const satisfies SourceProvenance;

const frontendVueProvenance = {
  repository: 'glass-projects-lab',
  repositoryCommit: REPOSITORY_COMMIT,
  projectDirectory: 'Frontend-Projects-main/liquid-glass-vue',
  deploymentProjectId: 'prj_fbzznK69OmeXFT1V0J6YDZOZddcd',
  sourceComponent: 'AppCard',
  sourceFiles: [
    {
      path: 'Frontend-Projects-main/liquid-glass-vue/src/App.vue',
      sha256:
        '2bbf3d3ad98cd4c7e3bfed15df2a01bcd99558ec04554675aa28bf727a752c92',
    },
    {
      path: 'Frontend-Projects-main/liquid-glass-vue/src/components/AppCard.vue',
      sha256:
        'cd723b8a4a719e19fcdefca986fdb171970cd6565c02064d3501b9a07c48c206',
      sourceLines: '1-58',
    },
    {
      path: 'Frontend-Projects-main/liquid-glass-vue/src/assets/main.css',
      sha256:
        'fd3a2c53f103e003ff7af7ebec4316f1dd649707156ac65039b02d8a3d8f0b65',
    },
    {
      path: 'Frontend-Projects-main/liquid-glass-vue/src/assets/base.css',
      sha256:
        '1ca278738408e6922f05ef5e1c489c96fb6574a1c3fdb7285ee65c2314fc07dc',
    },
  ],
  combinedSha256:
    '2a33dd08e4dea16a9c35ddace6b1d304757b046f3a4f5d9fe85537eb5c8fc314',
  auditedSourceState: 'clean',
} as const satisfies SourceProvenance;

export const LIQUID_DOM_GLASS_PROJECT_PRESETS = {
  notificationCenterMain: {
    id: 'liquid-dom:notification-center-main',
    kind: 'notification-center-main',
    label: 'Liquid DOM notification center main glass',
    rendererFamily: 'liquid-dom-webgpu',
    geometry: { width: 298, height: 528, cornerRadius: 70 },
    optics: {
      blur: 0,
      bezelWidth: 30,
      thickness: 90,
      displacementBlur: 0,
      ior: 1.5,
      dispersion: 0.2,
      tint: { r: 1, g: 1, b: 1, a: 0.1 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.18 },
      shadowOffsetY: 24,
      shadowBlur: 52,
      specularOpacity: 0,
      specularFalloff: 2.4,
      blendSupportGating: false,
    },
    provenance: notificationCenterProvenance,
    contentPolicy: 'object-only-empty-glass',
    opticalInput: 'experiment-eleven-stage-capture',
  },
  notificationCenterDock: {
    id: 'liquid-dom:notification-center-dock',
    kind: 'notification-center-dock',
    label: 'Liquid DOM notification center dock glass',
    rendererFamily: 'liquid-dom-webgpu',
    geometry: { width: 270, height: 84, cornerRadius: 36 },
    optics: {
      blur: 8,
      bezelWidth: 20,
      thickness: 90,
      displacementBlur: 6,
      tint: { r: 1, g: 1, b: 1, a: 0.1 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.05 },
      shadowOffsetY: 10,
      shadowBlur: 24,
      specularOpacity: 0.2,
      specularFalloff: 1,
      blendSupportGating: false,
    },
    provenance: notificationCenterProvenance,
    contentPolicy: 'object-only-empty-glass',
    opticalInput: 'experiment-eleven-stage-capture',
  },
  iosNotificationBanner: {
    id: 'liquid-dom:ios-notification-banner',
    kind: 'ios-notification-banner',
    label: 'Liquid DOM iOS notification banner glass',
    rendererFamily: 'liquid-dom-webgpu',
    geometry: { width: 616, height: 112, cornerRadius: 48 },
    optics: {
      blur: 12,
      spacing: 10,
      bezelWidth: 18,
      thickness: 90,
      tint: { r: 0.82, g: 0.92, b: 0.95, a: 0.22 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.2 },
      shadowOffsetY: 7,
      shadowBlur: 21,
      specularOpacity: 0.6,
      blendSupportGating: false,
    },
    provenance: iosNotificationProvenance,
    contentPolicy: 'object-only-empty-glass',
    opticalInput: 'experiment-eleven-stage-capture',
  },
} as const satisfies Record<string, LiquidDomGlassProjectPreset>;

export const LUCAS_ROMERO_DOCK_CONFIG = {
  backdropBlurPx: 3,
  tint: 'rgba(255, 255, 255, 0.50)',
  outerShadows: [
    '0 6px 6px rgba(0, 0, 0, 0.2)',
    '0 0 20px rgba(0, 0, 0, 0.1)',
  ],
  innerShadows: [
    'inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5)',
    'inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)',
  ],
  transition: {
    durationMs: 400,
    timingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
  },
  hover: {
    width: 541.1875,
    height: 126.1875,
    cornerRadius: 40,
    growthPerAxis: 12.8125,
    radiusDelta: 8,
  },
  filter: {
    filterUnits: 'objectBoundingBox',
    region: { x: '0%', y: '0%', width: '100%', height: '100%' },
    turbulence: {
      type: 'fractalNoise',
      baseFrequency: '0.01 0.01',
      numOctaves: 1,
      seed: 5,
    },
    componentTransfer: {
      red: { type: 'gamma', amplitude: 1, exponent: 10, offset: 0.5 },
      green: { type: 'gamma', amplitude: 0, exponent: 1, offset: 0 },
      blue: { type: 'gamma', amplitude: 0, exponent: 1, offset: 0.5 },
    },
    gaussianBlurStdDeviation: 3,
    specularLighting: {
      surfaceScale: 5,
      specularConstant: 1,
      specularExponent: 100,
      lightingColor: 'white',
      pointLight: { x: -200, y: -200, z: 300 },
    },
    composite: {
      operator: 'arithmetic',
      k1: 0,
      k2: 1,
      k3: 1,
      k4: 0,
    },
    displacement: {
      scale: 150,
      xChannelSelector: 'R',
      yChannelSelector: 'G',
    },
  },
} as const;

export type LucasRomeroDockConfig = typeof LUCAS_ROMERO_DOCK_CONFIG;

export const LUCAS_ROMERO_DOCK_PRESET = {
  id: 'lucas-romero:macos-dock-shell',
  kind: 'macos-dock-shell',
  label: 'Lucas Romero macOS dock empty glass shell',
  rendererFamily: 'css-svg-backdrop',
  geometry: { width: 528.375, height: 113.375, cornerRadius: 32 },
  config: LUCAS_ROMERO_DOCK_CONFIG,
  provenance: lucasRomeroProvenance,
  contentPolicy: 'object-only-empty-glass',
  opticalInput: 'live-experiment-eleven-stage-backdrop',
} as const satisfies CssSvgGlassProjectPreset;

export const APPLE_LIQUID_GLASS_SHADER_CONFIG = {
  ...APPLE_LIQUID_GLASS_SHADER_PARAMETERS,
  sourceShape: {
    width: 200,
    height: 200,
    cornerRadius: 50,
    technicalInset: 10,
  },
  fixedDpr: 1,
  pointerFollow: false,
  flowerContribution: false,
  outputAlpha: 'glass-shape-mask',
  textureInput: 'experiment-eleven-stage-capture',
} as const;

export type AppleLiquidGlassShaderConfig =
  typeof APPLE_LIQUID_GLASS_SHADER_CONFIG;

export const APPLE_LIQUID_GLASS_SHADER_PRESET = {
  id: 'apple-liquid-glass:shader-shell',
  kind: 'shader-shell',
  label: 'Apple liquid glass shader empty shell',
  rendererFamily: 'r3f-three-glsl',
  geometry: {
    width: 200,
    height: 200,
    cornerRadius: 50,
    technicalInset: 10,
  },
  config: APPLE_LIQUID_GLASS_SHADER_CONFIG,
  provenance: appleShaderProvenance,
  contentPolicy: 'object-only-empty-glass',
  opticalInput: 'experiment-eleven-stage-capture',
} as const satisfies ShaderGlassProjectPreset;

export const FRONTEND_VUE_APP_CARD_CONFIG = {
  paddingPx: 32,
  opacityTransitionMs: 260,
  opacityTransitionTiming: 'ease-out',
  dropShadow: {
    x: -8,
    y: -10,
    blur: 46,
    color: '#0000005f',
  },
  backdrop: {
    brightness: 1.1,
    blurPx: 2,
  },
  webkitInsetShadows: [
    'inset 2px 2px 0px -2px rgba(255, 255, 255, 0.7)',
    'inset 0 0 3px 1px rgba(255, 255, 255, 0.7)',
  ],
  insetShadows: [
    'inset 6px 6px 0px -6px rgba(255, 255, 255, 0.7)',
    'inset 0 0 8px 1px rgba(255, 255, 255, 0.7)',
  ],
  filter: {
    turbulence: {
      type: 'turbulence',
      baseFrequency: 0.01,
      numOctaves: 2,
    },
    displacement: {
      scale: 200,
      xChannelSelector: 'R',
      yChannelSelector: 'G',
    },
  },
  internalDrag: false,
} as const;

export type FrontendVueAppCardConfig =
  typeof FRONTEND_VUE_APP_CARD_CONFIG;

export const FRONTEND_VUE_APP_CARD_PRESET = {
  id: 'frontend-vue:app-card',
  kind: 'app-card',
  label: 'Frontend Vue AppCard empty glass shell',
  rendererFamily: 'vue-css-svg-backdrop',
  geometry: { width: 424, height: 184, cornerRadius: 28 },
  config: FRONTEND_VUE_APP_CARD_CONFIG,
  provenance: frontendVueProvenance,
  contentPolicy: 'object-only-empty-glass',
  opticalInput: 'live-experiment-eleven-stage-backdrop',
} as const satisfies CssSvgGlassProjectPreset;

export const GLASS_PROJECT_PRESETS = [
  LIQUID_DOM_GLASS_PROJECT_PRESETS.notificationCenterMain,
  LIQUID_DOM_GLASS_PROJECT_PRESETS.notificationCenterDock,
  LIQUID_DOM_GLASS_PROJECT_PRESETS.iosNotificationBanner,
  LUCAS_ROMERO_DOCK_PRESET,
  APPLE_LIQUID_GLASS_SHADER_PRESET,
  FRONTEND_VUE_APP_CARD_PRESET,
] as const satisfies readonly GlassProjectPreset[];

export const GLASS_PROJECT_PRESET_BY_ID = Object.fromEntries(
  GLASS_PROJECT_PRESETS.map((preset) => [preset.id, preset]),
) as unknown as Readonly<Record<GlassProjectObjectId, GlassProjectPreset>>;
