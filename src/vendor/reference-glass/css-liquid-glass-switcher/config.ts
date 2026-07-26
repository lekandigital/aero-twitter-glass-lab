import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export interface CssLiquidGlassSwitcherConfig {
  width: number;
  height: number;
  radius: number;
  glassColor: string;
  lightColor: string;
  darkColor: string;
  contentColor: string;
  actionColor: string;
  backgroundColor: string;
  glassReflexDark: number;
  glassReflexLight: number;
  saturation: string;
}

export const CSS_LIQUID_GLASS_SWITCHER_NATIVE_GEOMETRY = {
  width: 244,
  height: 70,
  radius: 35,
  boxModel: 'border-box',
} as const satisfies ReferenceObjectGeometry;

export const CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG = {
  width: CSS_LIQUID_GLASS_SWITCHER_NATIVE_GEOMETRY.width,
  height: CSS_LIQUID_GLASS_SWITCHER_NATIVE_GEOMETRY.height,
  radius: CSS_LIQUID_GLASS_SWITCHER_NATIVE_GEOMETRY.radius,
  glassColor: '#bbbbbc',
  lightColor: '#fff',
  darkColor: '#000',
  contentColor: '#224',
  actionColor: '#0052f5',
  backgroundColor: '#E8E8E9',
  glassReflexDark: 1,
  glassReflexLight: 1,
  saturation: '150%',
} as const satisfies CssLiquidGlassSwitcherConfig;

export function createCssLiquidGlassSwitcherGeometry(
  width: number,
  height: number,
  radius: number,
): CssLiquidGlassSwitcherConfig {
  return {
    ...CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
    width,
    height,
    radius,
  };
}

export const CSS_LIQUID_GLASS_SWITCHER_CONTRACT = {
  key: 'css-liquid-glass-switcher:.switcher',
  nativeGeometry: CSS_LIQUID_GLASS_SWITCHER_NATIVE_GEOMETRY,
  defaultConfig: CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'css-liquid-glass-switcher',
    sourceComponent: 'liquid-glass-switcher-css.html.switcher',
    sourceSelector: '.switcher',
    localAdaptedPath:
      'src/vendor/reference-glass/css-liquid-glass-switcher/CssLiquidGlassSwitcher.tsx',
    renderer: 'css-backdrop-svg-displacement',
    sourceFiles: [
      {
        path: 'lab-main 2/front-end/liquid-glass-switcher-css.html',
        sha256:
          '2117652d7d26ad16a93c6490e3cd7d2d5d9d7f7606353bdd59844383ed1d8914',
        role: 'authoritative HTML, CSS, embedded WebP displacement map',
      },
    ],
    omittedVisibleContent: [
      'legend',
      'three labels and radio inputs',
      'theme icons',
      'theme-switching script',
      'source article and page background',
    ],
    intentionalAdaptations: [
      'source filter id is collision-scoped per React mount',
      'source fixed positioning is delegated to the Layer C portal',
      'empty object freezes the source first-option pseudo surface at translate 0',
      'width, height, and radius are explicit source-supported geometry inputs',
    ],
  },
} as const satisfies ReferenceObjectContract<CssLiquidGlassSwitcherConfig>;
