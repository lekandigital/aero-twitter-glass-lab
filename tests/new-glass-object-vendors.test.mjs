import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  CSS_LIQUID_GLASS_SWITCHER_CONTRACT,
  CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
  createCssLiquidGlassSwitcherGeometry,
} from '../src/vendor/reference-glass/css-liquid-glass-switcher/config.ts'
import {
  LIQUID_GLASS_DIST_CONTRACT,
  LIQUID_GLASS_DIST_DEFAULT_CONFIG,
  LIQUID_GLASS_DIST_SOURCE_DECLARATION,
  createLiquidGlassDistGeometry,
} from '../src/vendor/reference-glass/liquid-glass-dist/config.ts'
import {
  CHROMIUM_CONFIGURABLE_GLASS_CONTRACT,
  CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
  createChromiumConfigurableGlassGeometry,
} from '../src/vendor/reference-glass/chromium-configurable-glass/config.ts'
import {
  buildChromiumGlassDisplacementSvg,
  chromiumGlassEdgeSize,
} from '../src/vendor/reference-glass/chromium-configurable-glass/displacementMap.ts'
import {
  PURE_CSS_IOS_26_CONTAINER_CONTRACT,
  PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
  createPureCssIos26ContainerGeometry,
} from '../src/vendor/reference-glass/pure-css-ios-26/config.ts'
import {
  LIQUID_GLASS_JS_RECT_CONTRACT,
  LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
  createLiquidGlassJsRectGeometry,
} from '../src/vendor/reference-glass/liquid-glass-js/config.ts'
import {
  LIQUID_GLASS_JS_FRAGMENT_SHADER,
  LIQUID_GLASS_JS_VERTEX_SHADER,
} from '../src/vendor/reference-glass/liquid-glass-js/shaders.ts'
import {
  LIQUID_GLASS_SHADER_CONTRACT,
  LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
  LIQUID_GLASS_SHADER_SOURCE_GEOMETRY,
  createLiquidGlassShaderGeometryAdaptation,
} from '../src/vendor/reference-glass/liquid-glass-shader/config.ts'
import {
  LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT,
  LIQUID_GLASS_SHADER_FRAGMENT,
  LIQUID_GLASS_SHADER_VERTEX,
} from '../src/vendor/reference-glass/liquid-glass-shader/shaders.ts'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'

/**
 * The geometry the standardized duplicates are actually resized to. Imported
 * from the shared constant so this test exercises the shipped values rather
 * than a stale literal. (Distinct from the Chromium *source-native* requested
 * config, which legitimately remains 358 × 140 r54 and is asserted as such.)
 */
const STANDARD_GEOMETRY = EXPERIMENT_ELEVEN_LAYER_C_LAYOUT
const GEOMETRY_KEYS = ['height', 'radius', 'width']

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizedShaderHash(source) {
  return sha256(source.replace(/\/\/.*$/gm, '').replace(/\s+/g, ''))
}

function differingKeys(left, right) {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key]))
    .sort()
}

test('six new object contracts expose exact local provenance and native geometry', () => {
  const contracts = [
    CSS_LIQUID_GLASS_SWITCHER_CONTRACT,
    LIQUID_GLASS_DIST_CONTRACT,
    CHROMIUM_CONFIGURABLE_GLASS_CONTRACT,
    LIQUID_GLASS_SHADER_CONTRACT,
    PURE_CSS_IOS_26_CONTAINER_CONTRACT,
    LIQUID_GLASS_JS_RECT_CONTRACT,
  ]
  assert.equal(new Set(contracts.map((contract) => contract.key)).size, 6)
  for (const contract of contracts) {
    assert.equal(
      contract.provenance.sourceRepository,
      'https://github.com/lekandigital/glass-projects-lab.git',
    )
    assert.equal(
      contract.provenance.sourceCommit,
      '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    )
    assert.ok(contract.provenance.sourceSelector.length > 0)
    assert.match(
      contract.provenance.localAdaptedPath,
      /^src\/vendor\/reference-glass\//,
    )
    assert.ok(contract.provenance.renderer.length > 0)
    assert.ok(contract.provenance.sourceFiles.length > 0)
    assert.ok(contract.provenance.omittedVisibleContent.length > 0)
    assert.ok(contract.provenance.intentionalAdaptations.length > 0)
    for (const source of contract.provenance.sourceFiles) {
      assert.match(source.sha256, /^[a-f0-9]{64}$/)
      assert.ok(!source.path.startsWith('http'))
    }
  }
  assert.deepEqual(CSS_LIQUID_GLASS_SWITCHER_CONTRACT.nativeGeometry, {
    width: 244,
    height: 70,
    radius: 35,
    boxModel: 'border-box',
  })
  assert.deepEqual(LIQUID_GLASS_DIST_CONTRACT.nativeGeometry, {
    width: 324,
    height: 324,
    radius: 162,
    boxModel: 'content-box',
  })
  assert.deepEqual(PURE_CSS_IOS_26_CONTAINER_CONTRACT.nativeGeometry, {
    width: 300,
    height: 200,
    radius: 30,
    boxModel: 'border-box',
  })
  assert.deepEqual(LIQUID_GLASS_JS_RECT_CONTRACT.nativeGeometry, {
    width: 196,
    height: 90,
    radius: 36,
    boxModel: 'border-box',
  })
})

test('source-supported resized configs differ only by width, height, and radius', () => {
  const pairs = [
    [
      CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
      createCssLiquidGlassSwitcherGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      ),
    ],
    [
      LIQUID_GLASS_DIST_DEFAULT_CONFIG,
      createLiquidGlassDistGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      ),
    ],
    [
      CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
      createChromiumConfigurableGlassGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      ),
    ],
    [
      PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
      createPureCssIos26ContainerGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      ),
    ],
    [
      LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
      createLiquidGlassJsRectGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      ),
    ],
  ]
  for (const [original, resized] of pairs) {
    assert.deepEqual(
      {
        width: resized.width,
        height: resized.height,
        radius: resized.radius,
      },
      STANDARD_GEOMETRY,
    )
    const expectedKeys =
      original.width === STANDARD_GEOMETRY.width &&
      original.height === STANDARD_GEOMETRY.height &&
      original.radius === STANDARD_GEOMETRY.radius
        ? []
        : GEOMETRY_KEYS
    assert.deepEqual(differingKeys(original, resized), expectedKeys)
  }
})

test('dist geometry preserves the source content-box border exactly', () => {
  assert.deepEqual(LIQUID_GLASS_DIST_SOURCE_DECLARATION, {
    contentWidth: 320,
    contentHeight: 320,
    widthCss: '20rem',
    heightCss: '20rem',
    radiusCss: '50%',
    borderWidth: 2,
    rootFontSizeAtSource: 16,
  })
  const resized = createLiquidGlassDistGeometry(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      )
  assert.equal(
    resized.width - resized.borderWidth * 2,
    STANDARD_GEOMETRY.width - resized.borderWidth * 2,
  )
  assert.equal(
    resized.height - resized.borderWidth * 2,
    STANDARD_GEOMETRY.height - resized.borderWidth * 2,
  )
  assert.equal(resized.width, 293)
  assert.equal(resized.height, 125)
})

test('Chromium free mode keeps exact numeric semantics and map generation', () => {
  const config = CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG
  assert.deepEqual(
    {
      mode: config.mode,
      theme: config.theme,
      frost: config.frost,
      saturation: config.saturation,
      icons: config.icons,
      width: config.width,
      height: config.height,
      radius: config.radius,
      border: config.border,
      alpha: config.alpha,
      lightness: config.lightness,
      inputBlur: config.inputBlur,
      outputBlur: config.outputBlur,
      xChannel: config.xChannel,
      yChannel: config.yChannel,
      blend: config.blend,
      scale: config.scale,
      redOffset: config.redOffset,
      greenOffset: config.greenOffset,
      blueOffset: config.blueOffset,
    },
    {
      mode: 'free',
      theme: 'system',
      frost: 0,
      saturation: 1,
      icons: false,
      width: 358,
      height: 140,
      radius: 54,
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
    },
  )
  assert.equal(chromiumGlassEdgeSize(config), 4.9)
  const svg = buildChromiumGlassDisplacementSvg(config)
  assert.match(svg, /viewBox="0 0 358 140"/)
  assert.match(svg, /x="4\.9" y="4\.9" width="348\.2" height="130\.2"/)
  assert.match(svg, /rx="54"/)
  assert.match(svg, /mix-blend-mode: difference/)
  assert.match(svg, /filter:blur\(11px\)/)
  assert.match(svg, /fill="hsl\(0 0% 50% \/ 0\.93"/)
  assert.doesNotMatch(svg, /fill="hsl\(0 0% 50% \/ 0\.93\)"/)
})

test('vendored embedded filter maps are exact local binary assets', () => {
  const switcher = readFileSync(
    new URL(
      '../public/vendor/reference-glass/css-liquid-glass-switcher/switcher-map.webp',
      import.meta.url,
    ),
  )
  const frosted = readFileSync(
    new URL(
      '../public/vendor/reference-glass/liquid-glass-dist/frosted-map.png',
      import.meta.url,
    ),
  )
  assert.equal(
    sha256(switcher),
    '6475a2bf80d1dad57b98ffe7bb38acd62eac3386abdca245e73dd9f36287813d',
  )
  assert.equal(
    sha256(frosted),
    '0dab2624648a6d2cae916e832055a21a3f205cb78182ac1d857509e739639de2',
  )
  assert.equal(switcher.subarray(0, 4).toString('ascii'), 'RIFF')
  assert.equal(switcher.subarray(8, 12).toString('ascii'), 'WEBP')
  assert.equal(frosted.readUInt32BE(16), 200)
  assert.equal(frosted.readUInt32BE(20), 200)
})

test('both first-pass WebGL programs retain normalized authoritative source hashes', () => {
  assert.equal(
    normalizedShaderHash(LIQUID_GLASS_SHADER_VERTEX),
    'aefd29257be86bac8eda498fb8aa962325d5d337e9e56ea48893f8ea34f2f1d2',
  )
  assert.equal(
    normalizedShaderHash(LIQUID_GLASS_SHADER_FRAGMENT),
    '5c110ccd1281ec14d2f639befffba9686fea5839540d2d644ab6a369565ac75a',
  )
  assert.equal(
    normalizedShaderHash(LIQUID_GLASS_JS_VERTEX_SHADER),
    '477756b31dd53fb91d5fc16f177b734dc25c1b6bedb55f309e17afbabd4eb8a8',
  )
  assert.equal(
    normalizedShaderHash(LIQUID_GLASS_JS_FRAGMENT_SHADER),
    '1d40b51bfcba55b38b2dc0cb79e6916f0128c90ef70b5870210354cc785bad93',
  )
  assert.match(
    LIQUID_GLASS_SHADER_FRAGMENT,
    /else \{\s*fragColor = texture2D\(iChannel0, uv\);/,
  )
  assert.match(
    LIQUID_GLASS_JS_FRAGMENT_SHADER,
    /gl_FragColor = vec4\(color\.rgb, mask\);/,
  )
})

test('shader geometry incompatibility is explicit and isolated to the composite pass', () => {
  assert.equal(
    LIQUID_GLASS_SHADER_SOURCE_GEOMETRY.boundingSizePerViewportHeight,
    0.4308869380063768,
  )
  assert.equal(LIQUID_GLASS_SHADER_DEFAULT_CONFIG.radius, null)
  assert.equal(
    LIQUID_GLASS_SHADER_DEFAULT_CONFIG.outputMask,
    'source-superellipse',
  )
  const resized = createLiquidGlassShaderGeometryAdaptation(
        STANDARD_GEOMETRY.width,
        STANDARD_GEOMETRY.height,
        STANDARD_GEOMETRY.radius,
      )
  assert.deepEqual(
    {
      width: resized.width,
      height: resized.height,
      radius: resized.radius,
      outputMask: resized.outputMask,
    },
    {
      width: STANDARD_GEOMETRY.width,
      height: STANDARD_GEOMETRY.height,
      radius: STANDARD_GEOMETRY.radius,
      outputMask: 'rounded-rect-geometry-adaptation',
    },
  )
  assert.match(LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT, /sourceTransition/)
  assert.match(
    LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT,
    /roundedRectDistance/,
  )
  assert.doesNotMatch(
    LIQUID_GLASS_SHADER_FRAGMENT,
    /u_outputRadius|u_geometryMode/,
  )
})

test('renderer roots expose stable object-only audit attributes', () => {
  const files = [
    '../src/vendor/reference-glass/css-liquid-glass-switcher/CssLiquidGlassSwitcher.tsx',
    '../src/vendor/reference-glass/liquid-glass-dist/LiquidGlassDistSurface.tsx',
    '../src/vendor/reference-glass/chromium-configurable-glass/ChromiumConfigurableGlass.tsx',
    '../src/vendor/reference-glass/liquid-glass-shader/LiquidGlassShaderSurface.tsx',
    '../src/vendor/reference-glass/pure-css-ios-26/PureCssIos26GlassContainer.tsx',
    '../src/vendor/reference-glass/liquid-glass-js/LiquidGlassJsRectSurface.tsx',
  ]
  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.match(source, /data-e11-reference-object-root/)
    assert.match(source, /data-source-family/)
    assert.match(source, /data-source-preset-key/)
    assert.match(source, /data-source-component/)
    assert.match(source, /data-renderer-family/)
    assert.match(source, /data-content-policy="object-only-empty"/)
    assert.match(source, /data-transparent-render-surface="true"/)
  }
  const liquidJsRenderer = readFileSync(
    new URL(
      '../src/vendor/reference-glass/liquid-glass-js/LiquidGlassJsRectSurface.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  assert.doesNotMatch(liquidJsRenderer, /Hello 🍏|alert\(/)
})
