import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  BUTTON_EXPERIMENTS,
  BUTTON_EXPERIMENT_SET_ID,
  BUTTON_EXPERIMENT_SET_NAME,
} from '../src/components/button-experiment-set/types.ts'
import {
  REFERENCE_BUTTON_EXPECTED_COUNT,
  REFERENCE_BUTTON_PRESET_IDS,
  REFERENCE_BUTTON_PRESETS,
  REFERENCE_BUTTON_PRESETS_BY_ID,
} from '../src/components/button-experiment-set/registry.ts'
import {
  BUTTON_EXPERIMENT_SAVES,
  BUTTON_INVENTORY_AUDIT,
  BUTTON_SAVE_ID_END,
  BUTTON_SAVE_ID_START,
} from '../src/components/button-experiment-set/saves.ts'
import {
  EXACT_CONTAINER_SVG_SOURCE,
  EXACT_FILTERED_SVG_SOURCE,
} from '../src/components/button-experiment-set/renderers/exactSvgSource.ts'
import {
  LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS,
  LIQUID_DOM_SHOWCASE_BUTTON_CONFIG_BY_ID,
  SHOWCASE_LIQUID_GLASS_FAMILIES,
  VIDEO_SKIP_PATHS,
  getShowcaseTechnicalInset,
} from '../src/components/button-experiment-set/renderers/showcaseConfig.ts'

const expectedPresetIds = [
  'container-svg:control-dark',
  'container-svg:control-light',
  'container-svg:control-blue',
  'default-clickable:go-filter9',
  'aqua-button:a',
  'aqua-button:b',
  'buttons-before-after:before',
  'buttons-before-after:after',
  'dock-gradient:get-dock',
  'button-lab-glass:generate',
  'turbo-button:liquid',
  'glass-like-css:glassy',
  'glass-button-html:hero',
  'glass-button-html:soft',
  'glass-button-html:spectrum',
  'glass-button-html:ink',
  'glass-projects-glass:generate',
  'liquid-dom-showcase:tab-notification',
  'liquid-dom-showcase:tab-video-controls',
  'liquid-dom-showcase:tab-music-sidebar',
  'liquid-dom-showcase:tab-control-center',
  'liquid-dom-showcase:tab-menu',
  'liquid-dom-showcase:tab-r3f-integration',
  'liquid-dom-showcase:tab-notification-center',
  'liquid-dom-showcase:control-airplane',
  'liquid-dom-showcase:control-airdrop',
  'liquid-dom-showcase:control-wifi',
  'liquid-dom-showcase:control-small-grid',
  'liquid-dom-showcase:control-airplay',
  'liquid-dom-showcase:control-skip-back',
  'liquid-dom-showcase:control-play',
  'liquid-dom-showcase:control-skip-forward',
  'liquid-dom-showcase:ios-night-mode',
  'liquid-dom-showcase:ios-options-action',
  'liquid-dom-showcase:ios-clear-action',
  'liquid-dom-showcase:menu-dots',
  'liquid-dom-showcase:menu-slow-mo',
  'liquid-dom-showcase:music-search',
  'liquid-dom-showcase:music-home',
  'liquid-dom-showcase:music-new',
  'liquid-dom-showcase:music-radio',
  'liquid-dom-showcase:music-recently-added',
  'liquid-dom-showcase:music-artists',
  'liquid-dom-showcase:music-albums',
  'liquid-dom-showcase:music-songs',
  'liquid-dom-showcase:music-made-for-you',
  'liquid-dom-showcase:music-all-playlists',
  'liquid-dom-showcase:music-favourite-songs',
  'liquid-dom-showcase:notification-flashlight',
  'liquid-dom-showcase:notification-camera',
  'liquid-dom-showcase:video-rewind-10',
  'liquid-dom-showcase:video-forward-10',
  'liquid-dom-showcase:video-play',
  'liquid-custom-demo:toggle-hubs',
  'wge-next:nav-top',
  'web-glass:nav-default',
  'web-glass:nav-hovered',
  'pure-css-ios26:glass-button',
  'liquid-glass-js:circle-play',
]

const expectedShowcasePresetIds = expectedPresetIds.filter((id) =>
  id.startsWith('liquid-dom-showcase:'),
)

test('the button experiment set has the exact six named experiments', () => {
  assert.equal(BUTTON_EXPERIMENT_SET_ID, 'button-source-experiments')
  assert.equal(BUTTON_EXPERIMENT_SET_NAME, 'Button Source Experiments')
  assert.deepEqual(
    BUTTON_EXPERIMENTS.map(({ label }) => label),
    [
      'Button Left Bottom',
      'Button Left Top',
      'Button Middle Right',
      'Button Middle Left',
      'Search Bar',
      'Gear Icon',
    ],
  )
})

test('authoritative discovery, registry, saves, and audit are complete 1:1 mappings', () => {
  assert.equal(REFERENCE_BUTTON_EXPECTED_COUNT, 59)
  assert.deepEqual(REFERENCE_BUTTON_PRESET_IDS, expectedPresetIds)
  assert.equal(REFERENCE_BUTTON_PRESETS.length, 59)
  assert.equal(BUTTON_EXPERIMENT_SAVES.length, 59)
  assert.equal(BUTTON_INVENTORY_AUDIT.length, 59)
  assert.equal(new Set(REFERENCE_BUTTON_PRESET_IDS).size, 59)
  assert.equal(new Set(BUTTON_EXPERIMENT_SAVES.map(({ id }) => id)).size, 59)
  assert.deepEqual(
    BUTTON_EXPERIMENT_SAVES.map(({ layerA }) => layerA.presetId),
    expectedPresetIds,
  )
  assert.deepEqual(
    BUTTON_INVENTORY_AUDIT.map(({ presetId }) => presetId),
    expectedPresetIds,
  )
})

test('button saves occupy exactly the reserved 1092–1150 range', () => {
  assert.equal(BUTTON_SAVE_ID_START, 1092)
  assert.equal(BUTTON_SAVE_ID_END, 1150)
  assert.deepEqual(
    BUTTON_EXPERIMENT_SAVES.map(({ id }) => id),
    Array.from({ length: 59 }, (_, index) => 1092 + index),
  )
  for (const save of BUTTON_EXPERIMENT_SAVES) {
    assert.equal(save.experimentSetId, BUTTON_EXPERIMENT_SET_ID)
    assert.deepEqual(Object.keys(save).sort(), ['experimentSetId', 'id', 'label', 'layerA', 'savedAt'])
    assert.deepEqual(Object.keys(save.layerA), ['presetId'])
  }
})

test('every button definition carries exact-source registry fields', () => {
  for (const preset of REFERENCE_BUTTON_PRESETS) {
    assert.equal(REFERENCE_BUTTON_PRESETS_BY_ID[preset.id], preset)
    assert.ok(preset.label.length > 0, `${preset.id} label`)
    assert.ok(preset.family.length > 0, `${preset.id} family`)
    assert.ok(preset.sourcePath.length > 0, `${preset.id} path`)
    assert.ok(preset.sourceUrl.length > 0, `${preset.id} URL`)
    assert.ok(preset.sourceSelector || preset.sourceComponent, `${preset.id} selector/component`)
    assert.ok(preset.sourceKey.length > 0, `${preset.id} source key`)
    assert.ok(['default', 'hovered', 'checked', 'other'].includes(preset.sourceState))
    assert.ok(preset.nativeWidth > 0, `${preset.id} native width`)
    assert.ok(preset.nativeHeight > 0, `${preset.id} native height`)
    assert.ok(preset.nativeRadius >= 0, `${preset.id} native radius`)
    assert.ok(preset.renderer.length > 0, `${preset.id} renderer`)
    assert.ok(preset.visibleContentPolicy.length > 0, `${preset.id} content policy`)
    assert.ok(preset.hoverBehavior.length > 0, `${preset.id} hover`)
    assert.ok(preset.pressedBehavior.length > 0, `${preset.id} pressed`)
    assert.ok(preset.focusBehavior.length > 0, `${preset.id} focus`)
    assert.match(preset.provenanceHash, /^[a-f0-9]{64}$/, `${preset.id} provenance`)
  }
})

test('group counts match authoritative persistent source objects and requested states', () => {
  const ids = REFERENCE_BUTTON_PRESET_IDS
  const count = (prefix) => ids.filter((id) => id.startsWith(prefix)).length
  assert.deepEqual(
    [
      count('container-svg:'),
      count('default-clickable:'),
      count('aqua-button:'),
      count('buttons-before-after:'),
      count('dock-gradient:'),
      count('button-lab-glass:'),
      count('turbo-button:'),
      count('glass-like-css:'),
      count('glass-button-html:'),
      count('glass-projects-glass:'),
      count('liquid-dom-showcase:'),
      count('liquid-custom-demo:'),
      count('wge-next:'),
      count('web-glass:'),
      count('pure-css-ios26:'),
      count('liquid-glass-js:'),
    ],
    [3, 1, 2, 2, 1, 1, 1, 1, 4, 1, 36, 1, 1, 2, 1, 1],
  )
  assert.deepEqual(
    ids.filter((id) => id.startsWith('web-glass:')),
    ['web-glass:nav-default', 'web-glass:nav-hovered'],
  )
})

test('Group K runtime config is the authoritative 36-object source map', () => {
  assert.equal(LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.length, 36)
  assert.deepEqual(
    LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.map(({ id }) => id),
    expectedShowcasePresetIds,
  )
  assert.equal(
    new Set(LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.map(({ id }) => id)).size,
    36,
  )

  const count = (key, value) =>
    LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.filter(
      (config) => config[key] === value,
    ).length
  assert.deepEqual(
    {
      htmlCss: count('sourceMode', 'html-css'),
      liquidDomWebgpu: count('sourceMode', 'liquid-dom-webgpu'),
      tabs: count('kind', 'tab'),
      controlCenter: count('kind', 'control-center'),
      toggles: count('kind', 'toggle'),
      musicSidebar: count('kind', 'music-sidebar'),
      liquidGlass: count('kind', 'liquid-glass'),
    },
    {
      htmlCss: 28,
      liquidDomWebgpu: 8,
      tabs: 7,
      controlCenter: 8,
      toggles: 2,
      musicSidebar: 11,
      liquidGlass: 8,
    },
  )

  const liquidConfigs = LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.filter(
    (config) => config.kind === 'liquid-glass',
  )
  assert.deepEqual(
    Object.fromEntries(
      Object.keys(SHOWCASE_LIQUID_GLASS_FAMILIES).map((family) => [
        family,
        liquidConfigs.filter((config) => config.family === family).length,
      ]),
    ),
    {
      'ios-action': 2,
      'menu-dots': 1,
      'notification-center': 2,
      'video-control': 3,
    },
  )

  for (const config of LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS) {
    assert.equal(LIQUID_DOM_SHOWCASE_BUTTON_CONFIG_BY_ID[config.id], config)
    const preset = REFERENCE_BUTTON_PRESETS_BY_ID[config.id]
    assert.ok(preset, config.id)
    assert.deepEqual(
      [preset.nativeWidth, preset.nativeHeight, preset.nativeRadius],
      [
        config.geometry.width,
        config.geometry.height,
        config.geometry.radius,
      ],
      `${config.id} native geometry`,
    )
    assert.equal(preset.options.exactConfigId, config.id)
    assert.equal(preset.options.sourceMode, config.sourceMode)
    assert.equal(preset.options.sourceKind, config.kind)
    if (config.sourceMode === 'liquid-dom-webgpu') {
      assert.ok(
        preset.requiredAssets.includes(
          '@liquid-dom/react authoritative local build',
        ),
        `${config.id} Liquid DOM runtime`,
      )
      assert.ok(
        preset.requiredAssets.includes('live button placement stage capture'),
        `${config.id} optical input`,
      )
    } else {
      assert.ok(
        !preset.requiredAssets.includes(
          '@liquid-dom/react authoritative local build',
        ),
        `${config.id} stays source-native HTML/CSS`,
      )
    }
  }
})

test('Group K carries exact Liquid DOM family optics, springs, and inline video paths', () => {
  assert.deepEqual(SHOWCASE_LIQUID_GLASS_FAMILIES, {
    'ios-action': {
      key: 'ios-action',
      hoverScale: 1.035,
      pressScale: 0.96,
      scaleSpring: { stiffness: 520, damping: 42 },
      optics: {
        blendSupportGating: false,
        blur: 12,
        spacing: 10,
        bezelWidth: 18,
        tint: { r: 0.82, g: 0.92, b: 0.95, a: 0.22 },
        shadowColor: { r: 0, g: 0, b: 0, a: 0.2 },
        shadowOffsetY: 7,
        shadowBlur: 21,
        specularOpacity: 0.6,
      },
    },
    'menu-dots': {
      key: 'menu-dots',
      hoverScale: 1.08,
      pressScale: 0.94,
      scaleSpring: { stiffness: 155, damping: 24 },
      optics: {
        blendSupportGating: false,
        blur: 20,
        spacing: 37,
        bezelWidth: 70,
        thickness: 40,
        displacementBlur: 20,
        contentIor: 1,
        contentDepth: 0,
        tint: { r: 1, g: 1, b: 1, a: 0.5 },
        shadowColor: { r: 0, g: 0, b: 0, a: 0.14 },
        shadowOffsetY: 18,
        shadowBlur: 46,
        specularOpacity: 0.7,
      },
    },
    'notification-center': {
      key: 'notification-center',
      hoverScale: 1.08,
      pressScale: 0.94,
      scaleSpring: { stiffness: 720, damping: 42 },
      optics: {
        blendSupportGating: false,
        blur: 4,
        bezelWidth: 10,
        thickness: 20,
        tint: { r: 1, g: 1, b: 1, a: 0.18 },
        shadowColor: { r: 0, g: 0, b: 0, a: 0.16 },
        shadowOffsetY: 10,
        shadowBlur: 22,
        specularOpacity: 0.5,
      },
    },
    'video-control': {
      key: 'video-control',
      hoverScale: 1.1,
      pressScale: 0.94,
      scaleSpring: { stiffness: 700, damping: 38 },
      optics: {
        blendSupportGating: false,
        ior: 1.5,
        blur: 4,
        spacing: 24,
        bezelWidth: 30,
        thickness: 30,
        tint: { r: 0, g: 0, b: 0, a: 0.25 },
        shadowColor: { r: 0, g: 0, b: 0, a: 0.22 },
        shadowOffsetY: 8,
        shadowBlur: 22,
        specularOpacity: 0.54,
      },
    },
  })
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(SHOWCASE_LIQUID_GLASS_FAMILIES).map(
        ([key, family]) => [key, getShowcaseTechnicalInset(family)],
      ),
    ),
    {
      'ios-action': 28,
      'menu-dots': 90,
      'notification-center': 32,
      'video-control': 30,
    },
  )
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(VIDEO_SKIP_PATHS).map(([key, path]) => [
        key,
        createHash('sha256').update(path).digest('hex'),
      ]),
    ),
    {
      back: '767c5252d2711ff1d97375b6c51cbdf2de9673b5c8452bad166c3e550de62170',
      forward:
        '8f21a32f1525f807050a6e203f1ef25d81fc6e93057da0835ed44d47b7a8838f',
    },
  )
})

test('Group K renderer structure uses exact source families instead of generic glass CSS', () => {
  const renderer = readFileSync(
    new URL(
      '../src/components/button-experiment-set/renderers/showcase.tsx',
      import.meta.url,
    ),
    'utf8',
  )
  const config = readFileSync(
    new URL(
      '../src/components/button-experiment-set/renderers/showcaseConfig.ts',
      import.meta.url,
    ),
    'utf8',
  )
  const moduleStyles = readFileSync(
    new URL(
      '../src/components/button-experiment-set/renderers/showcase.module.css',
      import.meta.url,
    ),
    'utf8',
  )
  const globalStyles = readFileSync(
    new URL('../src/styles/button-experiment-set.css', import.meta.url),
    'utf8',
  )
  const capture = readFileSync(
    new URL(
      '../src/components/button-experiment-set/renderers/useButtonStageCapture.ts',
      import.meta.url,
    ),
    'utf8',
  )

  for (const sourcePrimitive of [
    "from '@liquid-dom/react'",
    '<LiquidCanvas',
    '<GlassContainer',
    '<Transform',
    '<Frame',
    '<Glass',
    '<Html',
  ]) {
    assert.ok(renderer.includes(sourcePrimitive), sourcePrimitive)
  }
  assert.match(renderer, /data-source-renderer="@liquid-dom\/react"/)
  assert.match(renderer, /VIDEO_SKIP_PATHS\[direction\]/)
  assert.match(renderer, /setPaused\(\(value\) => !value\)/)
  assert.match(renderer, /onHover=\{setHovered\}/)
  assert.match(renderer, /onPress=\{setPressed\}/)
  assert.match(renderer, /setChecked\(\(value\) => !value\)/)
  assert.match(renderer, /setSelected\(true\)/)
  assert.match(renderer, /family\.key === 'ios-action'/)
  assert.doesNotMatch(renderer, /Sparkles|Mic2|Disc3/)
  assert.doesNotMatch(renderer, /radial-gradient|backdropFilter|boxShadow/)

  assert.match(config, /sourceMode: 'html-css'/)
  assert.match(config, /sourceMode: 'liquid-dom-webgpu'/)
  assert.match(moduleStyles, /color: #525252/)
  assert.match(moduleStyles, /background: #171717/)
  assert.match(moduleStyles, /background: #1d9bf7/)
  assert.match(moduleStyles, /color: #ff2d6d/)
  assert.match(moduleStyles, /\.liquidClip[\s\S]*overflow: visible/)
  assert.doesNotMatch(globalStyles, /\.button-src-showcase-/)

  assert.match(capture, /\.closest<HTMLElement>\('\.button-experiment-stage'\)/)
  assert.match(capture, /\.matches\('\.button-experiment-layer-a'\)/)
  assert.match(capture, /ignoreElements: isLayerAElement/)
  assert.match(capture, /backgroundColor: null/)
  assert.match(capture, /rootRect\.width \/ geometry\.width/)
})

test('route and mounted object expose Layer A only and stable source identity attributes', () => {
  const route = readFileSync(
    new URL('../src/routes/ButtonSourceExperiments.tsx', import.meta.url),
    'utf8',
  )
  const renderer = readFileSync(
    new URL('../src/components/button-experiment-set/ReferenceButtonRenderer.tsx', import.meta.url),
    'utf8',
  )
  assert.match(route, /data-layer="A"/)
  for (const layer of ['B', 'C', 'D', 'E']) {
    assert.doesNotMatch(route, new RegExp(`data-layer=["']${layer}["']`))
  }
  for (const attribute of [
    'data-reference-preset',
    'data-source-family',
    'data-source-path',
    'data-source-component',
    'data-source-key',
    'data-renderer-family',
    'data-content-policy',
  ]) {
    assert.match(renderer, new RegExp(attribute))
  }
})

test('selection traps remain singular and transient states do not create extra saves', () => {
  assert.equal(REFERENCE_BUTTON_PRESET_IDS.filter((id) => id.startsWith('wge-next:')).length, 1)
  assert.equal(REFERENCE_BUTTON_PRESET_IDS.filter((id) => id.startsWith('liquid-glass-js:')).length, 1)
  assert.equal(REFERENCE_BUTTON_PRESET_IDS.filter((id) => id.startsWith('liquid-custom-demo:')).length, 1)
  assert.equal(
    REFERENCE_BUTTON_PRESETS.filter(({ sourceState }) => sourceState === 'hovered').length,
    1,
  )
})

test('Groups A and B retain the exact isolated SVG source fragments and collision-safe IDs', () => {
  const hash = (...parts) => {
    const digest = createHash('sha256')
    parts.forEach((part, index) => {
      if (index > 0) digest.update('\0')
      digest.update(part)
    })
    return digest.digest('hex')
  }

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(EXACT_CONTAINER_SVG_SOURCE).map(([variant, source]) => [
        variant,
        {
          viewBox: source.viewBox,
          size: [source.width, source.height],
          digest: hash(source.filterMarkup, source.markup),
        },
      ]),
    ),
    {
      dark: {
        viewBox: '24 14 123 40',
        size: [123, 40],
        digest: 'aced9ac378480b35a6091056fe580b7fb4496854a68c15cf729ddb48231b5035',
      },
      light: {
        viewBox: '151 14 123 40',
        size: [123, 40],
        digest: 'e14699f65144c7f7683999398a796947f18adc56c7f8e6afd3f0d7d233c09f8b',
      },
      blue: {
        viewBox: '278 14 108 40',
        size: [108, 40],
        digest: 'ffd52e1650ee0c57e62d9f0546e7feaab3c10d6728fa7b070b572479b517c018',
      },
    },
  )
  for (const source of Object.values(EXACT_CONTAINER_SVG_SOURCE)) {
    assert.match(source.filterMarkup, /filterUnits="userSpaceOnUse"/)
    assert.match(source.filterMarkup, /operator="arithmetic" k2="-1" k3="1"/)
    assert.match(source.markup, /shape-rendering="crispEdges"/)
    assert.doesNotMatch(source.markup, /<text\b/)
  }

  assert.equal(EXACT_FILTERED_SVG_SOURCE.viewBox, '148.5 105.5 122 58')
  assert.deepEqual(
    [EXACT_FILTERED_SVG_SOURCE.width, EXACT_FILTERED_SVG_SOURCE.height],
    [122, 58],
  )
  assert.equal(
    hash(EXACT_FILTERED_SVG_SOURCE.definitionsMarkup, EXACT_FILTERED_SVG_SOURCE.markup),
    'f06d6890c83cc20b7c99e923ca5d2905a65bdfb37ca9f0f2ad6ad9d597779cd7',
  )
  assert.match(EXACT_FILTERED_SVG_SOURCE.definitionsMarkup, /<feMorphology radius="20" operator="erode"/)
  assert.match(EXACT_FILTERED_SVG_SOURCE.definitionsMarkup, /<feOffset dx="-2" dy="-4"/)
  assert.match(EXACT_FILTERED_SVG_SOURCE.markup, /M188\.361 143\.27/)
  assert.doesNotMatch(EXACT_FILTERED_SVG_SOURCE.markup, /<text\b/)

  const renderer = readFileSync(
    new URL('../src/components/button-experiment-set/renderers/sourceCss.tsx', import.meta.url),
    'utf8',
  )
  assert.match(renderer, /sourceIds\.reduce/)
  assert.match(renderer, /replaceAll\(sourceId, `\$\{prefix\}-\$\{sourceId\}`\)/)
  assert.match(renderer, /dangerouslySetInnerHTML=\{\{ __html: markup \}\}/)
  assert.doesNotMatch(renderer, /<feDropShadow\b/)
})

test('Group L toggles aria-pressed and exact source lens presence as one isolated state', () => {
  const optical = readFileSync(
    new URL('../src/components/button-experiment-set/renderers/optical.tsx', import.meta.url),
    'utf8',
  )
  const styles = readFileSync(
    new URL('../src/styles/button-experiment-set.css', import.meta.url),
    'utf8',
  )
  const preset = REFERENCE_BUTTON_PRESETS_BY_ID['liquid-custom-demo:toggle-hubs']

  assert.equal(preset.sourceState, 'checked')
  assert.equal(preset.options.isolatedFromFiveChoiceSegment, true)
  assert.equal(preset.options.uncheckedOmitsSelectionLens, true)
  assert.match(preset.visibleContentPolicy, /lens only while checked/)

  assert.match(optical, /const \[checked, setChecked\] = useState\(true\)/)
  assert.match(optical, /aria-pressed=\{checked\}/)
  assert.match(optical, /setChecked\(\(value\) => !value\)/)
  assert.match(optical, /data-lens-present=\{checked \? 'true' : 'false'\}/)
  assert.match(optical, /\{checked \? \(/)
  assert.match(optical, /className="button-src-liquid-toggle__unchecked"/)
  for (const exactProp of [
    'width={TOGGLE_LENS_WIDTH}',
    'height={46}',
    'strength={TOGGLE_REST_GLASS.strength}',
    'chromaticAberration={TOGGLE_REST_GLASS.chromaticAberration}',
    'curvature={0.85}',
    'depth={8}',
    'glow={0.15}',
    'edgeHighlight={0.35}',
  ]) {
    assert.ok(optical.includes(exactProp), exactProp)
  }
  assert.match(optical, /\(target\.strength - fx\.strength\) \* 0\.18/)
  assert.match(optical, /cancelAnimationFrame\(fxRef\.current\.raf\)/)
  assert.match(
    optical,
    /0 0 0 1px rgba\(255,255,255,0\.14\), 0 4px 14px rgba\(0,0,0,0\.45\)/,
  )

  assert.match(styles, /\.button-src-liquid-toggle__bar\.toggle/)
  assert.match(styles, /linear-gradient\(120deg, #17171d, #101015\)/)
  assert.match(styles, /color: #8d8d97/)
  assert.match(styles, /button\[aria-pressed="true"\]/)
})
