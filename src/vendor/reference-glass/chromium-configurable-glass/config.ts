import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export type ChromiumGlassTheme = 'system' | 'light' | 'dark';
export type ChromiumGlassChannel = 'R' | 'G' | 'B';
export type ChromiumGlassMapBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface ChromiumConfigurableGlassConfig {
  mode: 'free';
  theme: ChromiumGlassTheme;
  frost: number;
  saturation: number;
  icons: false;
  width: number;
  height: number;
  radius: number;
  border: number;
  alpha: number;
  lightness: number;
  inputBlur: number;
  outputBlur: number;
  xChannel: ChromiumGlassChannel;
  yChannel: ChromiumGlassChannel;
  blend: ChromiumGlassMapBlendMode;
  scale: number;
  redOffset: number;
  greenOffset: number;
  blueOffset: number;
}

export const CHROMIUM_CONFIGURABLE_GLASS_NATIVE_GEOMETRY = {
  width: 358,
  height: 140,
  radius: 54,
  boxModel: 'border-box',
} as const satisfies ReferenceObjectGeometry;

export const CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG = {
  mode: 'free',
  theme: 'system',
  frost: 0,
  saturation: 1,
  icons: false,
  width: CHROMIUM_CONFIGURABLE_GLASS_NATIVE_GEOMETRY.width,
  height: CHROMIUM_CONFIGURABLE_GLASS_NATIVE_GEOMETRY.height,
  radius: CHROMIUM_CONFIGURABLE_GLASS_NATIVE_GEOMETRY.radius,
  border: 0.07,
  alpha: 0.93,
  lightness: 50,
  inputBlur: 11,
  outputBlur: 0,
  xChannel: 'R',
  yChannel: 'B',
  blend: 'difference',
  scale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
} as const satisfies ChromiumConfigurableGlassConfig;

export function createChromiumConfigurableGlassGeometry(
  width: number,
  height: number,
  radius: number,
): ChromiumConfigurableGlassConfig {
  return {
    ...CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
    width,
    height,
    radius,
  };
}

export const CHROMIUM_CONFIGURABLE_GLASS_CONTRACT = {
  key: 'chromium-configurable-glass:free-358x140-r54',
  nativeGeometry: CHROMIUM_CONFIGURABLE_GLASS_NATIVE_GEOMETRY,
  defaultConfig: CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'liquid-glass-scroll-drag-configure-chromium',
    sourceComponent: 'dist .effect + generated displacement image',
    sourceSelector: '.effect',
    localAdaptedPath:
      'src/vendor/reference-glass/chromium-configurable-glass/ChromiumConfigurableGlass.tsx',
    renderer: 'chromium-css-backdrop-svg-channel-displacement',
    sourceFiles: [
      {
        path: 'liquid-glass-scroll-drag-configure-chromium/dist/index.html',
        sha256:
          '5c6a85ddcd1287a1a0c0e54ebe986f8bafa302acced310db411ebe735a7bf2c0',
        role: 'authoritative .effect DOM and SVG channel filter graph',
      },
      {
        path: 'liquid-glass-scroll-drag-configure-chromium/dist/style.css',
        sha256:
          '3c479b54def3e69bf239a05de2ee5bf358be12aea78a2d98563148eb7222b134',
        role: 'authoritative surface appearance',
      },
      {
        path: 'liquid-glass-scroll-drag-configure-chromium/dist/script.js',
        sha256:
          'b4df0dadfe3632d9f4923f2f111aa28b2eb3a108a0c966cb1c3a61e59bc9de5d',
        role: 'authoritative config semantics and generated SVG map',
      },
    ],
    omittedVisibleContent: [
      'dock navigation and four icons',
      'displacement debug image and label',
      'Tweakpane control panel',
      'source page content and annotations',
    ],
    intentionalAdaptations: [
      'source global SVG ids and selectors are collision-scoped per React mount',
      'Tweakpane and GSAP writes are expressed as declarative React attributes',
      'GSAP Draggable is omitted because Layer C owns object movement',
      'source-generated malformed hsl fill is retained byte-for-semantic intent',
      'source fixed positioning is delegated to the Layer C portal',
    ],
  },
} as const satisfies ReferenceObjectContract<ChromiumConfigurableGlassConfig>;
