import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export interface LiquidGlassJsRectConfig {
  width: number;
  height: number;
  radius: number;
  type: 'rounded';
  warp: false;
  tintOpacity: number;
  blurRadius: number;
  edgeIntensity: number;
  rimIntensity: number;
  baseIntensity: number;
  edgeDistance: number;
  rimDistance: number;
  baseDistance: number;
  cornerBoost: number;
  rippleEffect: number;
}

export const LIQUID_GLASS_JS_RECT_NATIVE_GEOMETRY = {
  width: 196,
  height: 90,
  radius: 36,
  boxModel: 'border-box',
} as const satisfies ReferenceObjectGeometry;

export const LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG = {
  width: LIQUID_GLASS_JS_RECT_NATIVE_GEOMETRY.width,
  height: LIQUID_GLASS_JS_RECT_NATIVE_GEOMETRY.height,
  radius: LIQUID_GLASS_JS_RECT_NATIVE_GEOMETRY.radius,
  type: 'rounded',
  warp: false,
  tintOpacity: 0.2,
  blurRadius: 5,
  edgeIntensity: 0.01,
  rimIntensity: 0.05,
  baseIntensity: 0.01,
  edgeDistance: 0.15,
  rimDistance: 0.8,
  baseDistance: 0.1,
  cornerBoost: 0.02,
  rippleEffect: 0.1,
} as const satisfies LiquidGlassJsRectConfig;

export function createLiquidGlassJsRectGeometry(
  width: number,
  height: number,
  radius: number,
): LiquidGlassJsRectConfig {
  return {
    ...LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
    width,
    height,
    radius,
  };
}

export const LIQUID_GLASS_JS_RECT_CONTRACT = {
  key: 'liquid-glass-js:hello-rounded-empty',
  nativeGeometry: LIQUID_GLASS_JS_RECT_NATIVE_GEOMETRY,
  defaultConfig: LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'liquid-glass-js',
    sourceComponent: 'Button extends Container; first rounded Hello demo',
    sourceSelector: '.glass-container.glass-button',
    localAdaptedPath:
      'src/vendor/reference-glass/liquid-glass-js/LiquidGlassJsRectSurface.tsx',
    renderer: 'webgl1-liquid-glass-js',
    sourceFiles: [
      {
        path: 'liquid-glass-js-main/index.html',
        sha256:
          '31d6c1f4d78740ee0948b135fac33f31cd76e02f12f3aa36ec5b91bcf8f91671',
        role: 'authoritative script loading and html2canvas dependency',
      },
      {
        path: 'liquid-glass-js-main/glass.css',
        sha256:
          '99dc2ee94be1e5d76402b3acdb3fe807332f533ef5be71721d5ed022b98fc813',
        role: 'authoritative wrapper and button CSS',
      },
      {
        path: 'liquid-glass-js-main/container.js',
        sha256:
          '7080217b7fb7e422d2b1f4043342d34fddafaed0a91b54d3f9105361c0f70d65',
        role: 'authoritative standalone WebGL renderer and shader',
      },
      {
        path: 'liquid-glass-js-main/button.js',
        sha256:
          'e8dbc8e96f4f8f0c64da4184e9b341776d8adedd42d788b92f9ad7049a9306e6',
        role: 'authoritative rectangular Button sizing and defaults',
      },
      {
        path: 'liquid-glass-js-main/demo.js',
        sha256:
          '5ffa1208c4ec23649ab0566ec2d9a5d28391fcb5931899bbd071fa2403dee901',
        role: 'authoritative first Hello Button instance and resize capture',
      },
      {
        path: 'liquid-glass-js-main/controls.js',
        sha256:
          '462e13fa0c615198ed1822cfc455f46e130146d787b6f6a8d6e76c2a62bd5828',
        role: 'authoritative shader control defaults',
      },
    ],
    omittedVisibleContent: [
      'Hello 🍏 text node',
      'click alert handler',
      'all other demo buttons and containers',
      'control panel and source page',
    ],
    intentionalAdaptations: [
      'html2canvas samples the live Experiment Eleven optical input at source scale 1',
      'source document coordinates are translated into the captured Layer B coordinate space',
      'source static globals and waiting queue become instance-local React lifecycle state',
      'Layer C movement is tracked without adding autonomous material motion',
      'canvas is kept in a local transparent stacking context after its only visible child was removed',
      'all WebGL resources, capture callbacks, listeners, observers, and frames are released at unmount',
    ],
  },
} as const satisfies ReferenceObjectContract<LiquidGlassJsRectConfig>;
