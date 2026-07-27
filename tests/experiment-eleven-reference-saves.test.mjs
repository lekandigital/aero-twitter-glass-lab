import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT,
  EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS,
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'

/**
 * The standardized duplicates render at the Save 248 Layer C geometry. The test
 * reads the shared constant rather than restating the numbers, so the assertion
 * cannot silently drift away from the source of truth.
 */
const STANDARDIZED_GEOMETRY = EXPERIMENT_ELEVEN_LAYER_C_LAYOUT

/**
 * `:358x140-r54` is a legacy internal id suffix retained for save/state
 * compatibility. It deliberately no longer describes the rendered geometry.
 */
const STANDARDIZED_LEGACY_ID_SUFFIX = ':358x140-r54'

const saves = JSON.parse(readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'))
const savesText = readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8')
const schema = JSON.parse(readFileSync(new URL('../src/data/experiment-set-one/saves.schema.json', import.meta.url), 'utf8'))
const referencePresetRendererSource = readFileSync(
  new URL('../src/components/experiment-set-one/ExperimentElevenReferencePresetRenderer.tsx', import.meta.url),
  'utf8',
)
const glassSurfaceSource = readFileSync(
  new URL('../src/vendor/reference-glass/glass-surface/GlassSurface.tsx', import.meta.url),
  'utf8',
)
function readPreReferenceSavesText() {
  for (let generations = 0; generations < 20; generations += 1) {
    const revision = generations === 0 ? 'HEAD' : `HEAD${'^'.repeat(generations)}`
    const text = execFileSync(
      'git',
      ['show', `${revision}:src/data/experiment-set-one/saves.json`],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    )
    const revisionSaves = JSON.parse(text)
    if (Math.max(...revisionSaves.map((save) => save.id)) < 1038) return text
  }
  throw new Error('Could not find the pre-reference-save baseline in recent Git history')
}

const headSavesText = readPreReferenceSavesText()
const headSaves = JSON.parse(headSavesText)
const headMaximumId = Math.max(...headSaves.map((save) => save.id))
const sourceSave = headSaves.find((save) => save.id === 249)
const generatedPresetIdSet = new Set(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS)
// Generator-owned records are identified by their preset id. Filtering on
// "id greater than the baseline maximum" would also sweep in unrelated
// user-authored saves that happen to sit above the reserved block.
const generated = saves
  .filter((save) => generatedPresetIdSet.has(save.e11LayerCReferencePreset))
  .sort((left, right) => left.id - right.id)
const originalGenerated = generated.slice(0, 30)
const newGenerated = generated.slice(30)

const expectedDefinitions = [
  ['liquid-main:custom-300x200', 'Liquid Glass Main · Custom 300×200', 'custom-300x200', 'liquid-main-svg-filter', [300, 200, 60, 'rounded-rect'], 'aa9f8e92aa89ea0b7630d12f23dc70c8a113c2080021450c9aee323b650da99a'],
  ['liquidgl:demo-1-nav', 'liquidGL Demo 1 · Nav bar', 'demo-1:.menu-wrap', 'liquidgl-webgl', [310.344, 75.188, 21.6, 'liquidgl-menu'], '8c53090749c2e0de0d8770fd2f7394beedcb6cd7f36cfda956bc56d20df85c02'],
  ['fluid-glass:lens', 'FluidGlass · Lens', 'DEMO_CONFIGS.lensDefault', 'fluid-glass-r3f', [320, 240, 10, 'three-lens'], '3d7d5738eaccb688a86c1959eac934a73b9ac3d0eafd5583195d26832c63864e'],
  ['fluid-glass:frosted', 'FluidGlass · Frosted', 'DEMO_CONFIGS.frosted', 'fluid-glass-r3f', [320, 240, 10, 'three-lens'], '3e0a9668b5f5b0e6967a62ed10d1c212751524b11d454ea52568b0230ffbf751'],
  ['fluid-glass:bar', 'FluidGlass · Bar', 'DEMO_CONFIGS.barDefault', 'fluid-glass-r3f', [320, 240, 10, 'three-bar'], 'a102bc7aaa4f1bda4ff1d7bd00526c4fd1ea5da5b97f13cbd1a9d1ff1850cc8b'],
  ['fluid-glass:diamond', 'FluidGlass · Diamond', 'DEMO_CONFIGS.diamond', 'fluid-glass-r3f', [320, 240, 10, 'three-cube'], 'bec16ee23d558a531e0b6a131e8cc19da285eca7c29822719a62e81e9dab72ec'],
  ['fluid-glass:fluid', 'FluidGlass · Fluid', 'DEMO_CONFIGS.fluid', 'fluid-glass-r3f', [320, 240, 10, 'three-lens'], '3e71834193cdb2743b64677edad4fca95c0d802d6bbb24b9f93196c77330ee6a'],
  ['liquid-web:apple', 'Liquid Glass Custom · Apple', 'PRESETS.Apple', 'liquid-glass-web-react', [220, 220, 110, 'circle'], '4bd1c3904a7d6732009334d5e6c9199d93b4df6edc6ec7ef0e9e90e5b57c1b42'],
  ['liquid-web:library-default', 'Liquid Glass Custom · Library default', 'PRESETS.Library default', 'liquid-glass-web-react', [220, 220, 110, 'circle'], '39d237039af07dae1a0dc9d8943036827f40a30eeea3d51711551dbbb74d2651'],
  ['liquid-web:fishbowl', 'Liquid Glass Custom · Fishbowl', 'PRESETS.Fishbowl', 'liquid-glass-web-react', [220, 220, 110, 'circle'], '210dffb623039746ccae460b6c92dc0d0bf4c67c92a32cac4c6c7ce537907da0'],
  ['liquid-web:frosted', 'Liquid Glass Custom · Frosted', 'PRESETS.Frosted', 'liquid-glass-web-react', [300, 190, 40, 'rounded-rect'], '956d6116a74f3aa90c7e4c6cb8d0da8b7ceba0882445b962f2b0face862db0d0'],
  ['liquid-web:prism', 'Liquid Glass Custom · Prism', 'PRESETS.Prism', 'liquid-glass-web-react', [240, 240, 120, 'circle'], 'e4f35ee5c732686a9ef9e7bb7762e0337f78493cdea6597b8b2db8ef1c4681c8'],
  ['liquid-web:flat-pane', 'Liquid Glass Custom · Flat pane', 'PRESETS.Flat pane', 'liquid-glass-web-react', [260, 260, 20, 'rounded-rect'], '5c8e34d602c6b0f5e7302f789e347fe250216c88fe0fca234799623f726ea985'],
  ['liquid-web:hero-circle', 'Liquid Glass Custom · Hero circle', 'PRESETS.Hero circle / DEMO_LENSES.hero', 'liquid-glass-web-react', [200, 200, 100, 'circle'], '0620143d9cd557d7f999f9ac1c86d85b70758ee6a992d6ac35db1acb902b1930'],
  ['liquid-web:reading-glass', 'Liquid Glass Custom · Reading glass', 'PRESETS.Reading glass / DEMO_LENSES.reading', 'liquid-glass-web-react', [150, 150, 75, 'circle'], '434131427e74bbd4ad598533d94ef7fdeaa2a7c65c0653b0b8a0f0759dedf16e'],
  ['liquid-web:orbit', 'Liquid Glass Custom · Orbit', 'PRESETS.Orbit / DEMO_LENSES.orbit', 'liquid-glass-web-react', [170, 170, 85, 'circle'], 'f08578c819481dd9e334dced4ff8d53293d0d5fb8ab93b376155af888dfc5295'],
  ['liquid-web:engine-panel', 'Liquid Glass Custom · Engine panel', 'PRESETS.Engine panel / DEMO_LENSES.engine', 'liquid-glass-web-react', [160, 160, 80, 'circle'], 'f56063beea49b706457a2e145933ba272a265185d354da4c883bdff06d2ccd9d'],
  ['wge-next:form-submit-button', 'WGE Next · Submit Form button', 'LiquidGlassFormDemo.submitButton', 'wge-next-submit-button', [384, 38, 18, 'source-button'], 'c5469d6005a3ca0c0ad3860bb91ee9362a62da7174ef128b035351ab72b0ccf2'],
  ['wge-next:bottom-bar', 'WGE Next · Glass bottom bar', 'LiquidGlassDemo.bottomBar', 'wge-next-bottom-bar', [640, 60, 28, 'rounded-rect'], 'bc1d01bbde0906d1fce092e88def7cf2ff5f37ee45a364af967f1949d83b8e89'],
  ['web-glass:thick-lens', 'Web Glass · Thick lens', 'PRESETS.thickLens', 'web-glass-svg-filter', [320, 200, 60, 'rounded-rect'], '3565acd7e385e3b77b6bbec8890aa9d96f1d317843152a287fbad8c58a7e3727'],
  ['web-glass:razor-edge', 'Web Glass · Razor edge', 'PRESETS.razorEdge', 'web-glass-svg-filter', [320, 200, 24, 'rounded-rect'], 'af5b88d0c85f65071c94d32cf1172c295a32746e2033528919b6f56d0b021353'],
  ['web-glass:bottom-bar', 'Web Glass · Bottom bar', 'PRESETS.bottomBar', 'web-glass-svg-filter', [320, 200, 28, 'rounded-rect'], '5577f0573fb5e00ca7fe80e56f313ce13087dff647e9c21cce626be2a2cb1096'],
  ['web-glass:stress-panel', 'Web Glass · Stress panel', 'PRESETS.stressPanel', 'web-glass-svg-filter', [320, 200, 28, 'rounded-rect'], '2bb7d2cd251ea028b99126791f64c40f8b2e7c0fecd3a3dadd60011b51932b0f'],
  ['web-glass:storybook', 'Web Glass · Storybook surface', 'PRESETS.storybook', 'web-glass-svg-filter', [320, 200, 30, 'rounded-rect'], 'c67d4666c4382e95e19628dee57ce2016f057dbfa48ccccd5c600a2281425496'],
  ['glass-surface:component-default', 'GlassSurface · Component default', 'DEMO_CONFIGS.componentDefault', 'glass-surface-svg-filter', [320, 120, 20, 'rounded-rect'], '6bb19ac1267ea540c93f8e53675b8c611e8d0223ed7a0813da2c48eaf0f45740'],
  ['glass-surface:upstream-demo', 'GlassSurface · Upstream demo', 'DEMO_CONFIGS.upstreamDemo', 'glass-surface-svg-filter', [320, 120, 50, 'rounded-rect'], '97bc61c08fe47827236cbcb07129819bdea3b866c714d6d617cb8b6d54900398'],
  ['glass-surface:ios-pill', 'GlassSurface · iOS pill', 'DEMO_CONFIGS.pill', 'glass-surface-svg-filter', [320, 120, 60, 'rounded-rect'], 'be626562948c1b1b356586c183fb6ef871545e04970ce768b0e70486561be98c'],
  ['glass-surface:prism', 'GlassSurface · Prism', 'DEMO_CONFIGS.prism', 'glass-surface-svg-filter', [320, 120, 24, 'rounded-rect'], '4b8c9515d35d4b39e08baa294768d81bd3f02bbff16930b81b5cd94860f3ea46'],
  ['glass-surface:achromatic', 'GlassSurface · Achromatic', 'DEMO_CONFIGS.achromatic', 'glass-surface-svg-filter', [320, 120, 24, 'rounded-rect'], '817afeb01d247dbd0b5e23aaee00d080256653e091d15efe265ff17dd6b03c2a'],
  ['glass-surface:convex', 'GlassSurface · Convex', 'DEMO_CONFIGS.convex', 'glass-surface-svg-filter', [320, 120, 30, 'rounded-rect'], '0da074927fdca71eac8a926aa0266d46416946ff5e49dd7c99102a7c7e9a3b4a'],
]
const expectedPresetIds = expectedDefinitions.map(([id]) => id)
const expectedNewBaseDefinitions = [
  ['liquid-dom:notification-center-main', 'Liquid DOM · Notification Center main glass', 'NotificationCenterDemo.mainGlass', [298, 528, 70, 'rounded-rect']],
  ['liquid-dom:notification-center-dock', 'Liquid DOM · Notification Center dock', 'NotificationCenterDemo.bottomGlassDock', [270, 84, 36, 'rounded-rect']],
  ['liquid-dom:ios-notification-banner', 'Liquid DOM · iOS notification banner', 'IosNotificationDemo.notificationGlass', [616, 112, 48, 'rounded-rect']],
  ['lucas-romero:macos-dock-shell', 'Lucas Romero · macOS dock shell', 'liquidGlass-wrapper.dock', [528.375, 113.375, 32, 'rounded-rect']],
  ['apple-liquid-glass:shader-shell', 'Apple Liquid Glass · Shader shell', 'script.js.LiquidGlass', [200, 200, 50, 'rounded-rect']],
  ['frontend-vue:app-card', 'Frontend Vue · AppCard glass', 'AppCard.vue', [424, 184, 28, 'rounded-rect']],
  ['css-liquid-glass-switcher:switcher', 'CSS Liquid Glass Switcher · Empty switcher', 'liquid-glass-switcher-css:.switcher', [244, 70, 35, 'rounded-rect']],
  ['liquid-glass-dist:glass', 'Liquid Glass Dist · Empty .glass', 'liquid-glass/dist:.glass', [324, 324, 162, 'rounded-rect']],
  ['chromium-configurable-glass:requested', 'Chromium Configurable Glass · Requested preset', 'CONFIG.free+requested-overrides', [358, 140, 54, 'rounded-rect']],
  ['liquid-glass-shader:lens', 'Liquid Glass Shader · Procedural lens', 'dist:#fragShader', [431, 431, 0, 'shader-superellipse']],
  ['pure-css-ios-26:glass-container', 'Pure CSS iOS 26 · Glass container', 'pure-css-ios-26:.glassContainer', [300, 200, 30, 'rounded-rect']],
  ['liquid-glass-js:rounded-rectangle', 'liquid-glass-js · Rounded rectangle', 'demo.js:helloButton', [196, 90, 36, 'rounded-rect']],
]
const expectedNewBasePresetIds = expectedNewBaseDefinitions.map(([id]) => id)
const expectedNewDuplicatePresetIds = expectedNewBasePresetIds.map(
  (id) => `${id}${STANDARDIZED_LEGACY_ID_SUFFIX}`,
)
const expectedAllPresetIds = [
  ...expectedPresetIds,
  ...expectedNewBasePresetIds,
  ...expectedNewDuplicatePresetIds,
]

const allowedDifferences = [
  'displayId',
  'e11LayerCInitialPosition',
  'e11LayerCLayout',
  'e11LayerCReferencePreset',
  'id',
  'label',
  'savedAt',
  'sourceSaveId',
]

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
  }
  return value
}

function canonicalHash(value) {
  return hash(canonicalize(value))
}

function differingKeys(left, right) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  return [...keys].filter((key) => JSON.stringify(left[key]) !== JSON.stringify(right[key])).sort()
}

function differingLeafPaths(left, right, prefix = '') {
  if (JSON.stringify(left) === JSON.stringify(right)) return []
  if (
    !left ||
    !right ||
    typeof left !== 'object' ||
    typeof right !== 'object' ||
    Array.isArray(left) ||
    Array.isArray(right)
  ) {
    return [prefix]
  }
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  return [...keys].flatMap((key) =>
    differingLeafPaths(
      left[key],
      right[key],
      prefix ? `${prefix}.${key}` : key,
    ),
  )
}

test('the registry preserves the original 30 and appends the requested 24 in exact source order', () => {
  assert.deepEqual(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS, expectedAllPresetIds)
  assert.deepEqual(
    EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.slice(0, 30),
    expectedPresetIds,
  )
  assert.equal(Object.keys(EXPERIMENT_ELEVEN_REFERENCE_PRESETS).length, 54)
  assert.equal(new Set(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS).size, 54)
  for (const id of expectedAllPresetIds) {
    assert.equal(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].id, id)
    assert.ok(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].sourcePath.length > 0)
    assert.ok(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].provenance.length > 0)
  }
})

test('the deterministic object audit names the exact transparent root for every save', () => {
  assert.equal(EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.length, 54)
  assert.deepEqual(
    EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.map((row) => row.saveId),
    Array.from({ length: 54 }, (_, index) => headMaximumId + index + 1),
  )
  for (const row of EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT) {
    const save = generated.find((candidate) => candidate.id === row.saveId)
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[row.presetId]
    assert.ok(save, `Save ${row.saveId}`)
    assert.equal(save.e11LayerCReferencePreset, row.presetId)
    assert.equal(row.sourceFamily, definition.sourceFamily)
    assert.equal(row.sourcePresetKey, definition.sourcePresetKey)
    assert.equal(row.renderer, definition.renderer)
    assert.equal(row.sourceComponent, definition.sourceComponent)
    assert.equal(row.portalRequired, definition.compositing.pageLevelPortal)
    assert.equal(row.transparentRenderSurface, true)
    assert.deepEqual(
      [row.nativeWidth, row.nativeHeight, row.nativeRadius, row.nativeGeometry],
      [
        definition.nativeLayout.width,
        definition.nativeLayout.height,
        definition.nativeLayout.radius,
        definition.nativeLayout.geometry,
      ],
    )
  }
})

test('every registry label, source mapping, renderer, native geometry, and full config is exact', () => {
  const configHashes = []
  for (const [id, displayLabel, sourcePresetKey, renderer, nativeLayout, configHash] of expectedDefinitions) {
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id]
    assert.equal(definition.displayLabel, displayLabel, `${id} display label`)
    assert.equal(definition.sourcePresetKey, sourcePresetKey, `${id} source preset`)
    assert.equal(definition.renderer, renderer, `${id} renderer`)
    assert.equal(
      definition.sourceComponent,
      EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.find((row) => row.presetId === id)
        ?.sourceComponent,
      `${id} source component`,
    )
    assert.equal(definition.transparentRenderSurface, true, `${id} transparent surface`)
    assert.deepEqual(
      [
        definition.nativeLayout.width,
        definition.nativeLayout.height,
        definition.nativeLayout.radius,
        definition.nativeLayout.geometry,
      ],
      nativeLayout,
      `${id} native layout`,
    )
    assert.equal(canonicalHash(definition.config), configHash, `${id} complete config`)
    assert.equal(definition.interactions.draggableLayerC, true, `${id} Layer C drag`)
    assert.ok(definition.compositing.notes.length > 0, `${id} compositing`)
    assert.ok(definition.sourcePath.every((path) => path.startsWith('glass-projects-lab/')), `${id} local provenance`)
    configHashes.push(configHash)
  }
  assert.equal(new Set(configHashes).size, 30, 'every requested preset has a distinct complete configuration')
})

test('Save 1066 keeps Achromatic exact and alone expands its source-aligned filter bounds', () => {
  const save1066 = saves.find((save) => save.id === 1066)
  const achromatic = EXPERIMENT_ELEVEN_REFERENCE_PRESETS['glass-surface:achromatic']

  assert.ok(save1066)
  assert.equal(save1066.e11LayerCReferencePreset, 'glass-surface:achromatic')
  assert.deepEqual(save1066.e11LayerCLayout, {
    width: 320,
    height: 120,
    radius: 24,
  })
  assert.deepEqual(achromatic.nativeLayout, {
    width: 320,
    height: 120,
    radius: 24,
    geometry: 'rounded-rect',
  })
  assert.equal(
    canonicalHash(achromatic.config),
    '817afeb01d247dbd0b5e23aaee00d080256653e091d15efe265ff17dd6b03c2a',
  )

  assert.match(
    referencePresetRendererSource,
    /presetId === 'glass-surface:achromatic' \? 100 : 0/,
  )
  assert.ok(glassSurfaceSource.includes('filterRegionPaddingPercent = 0'))
  assert.ok(glassSurfaceSource.includes('filterUnits="objectBoundingBox"'))
  assert.ok(glassSurfaceSource.includes('x={`${-filterRegionPaddingPercent}%`}'))
  assert.ok(glassSurfaceSource.includes('y={`${-filterRegionPaddingPercent}%`}'))
  assert.ok(
    glassSurfaceSource.includes(
      'width={`${100 + filterRegionPaddingPercent * 2}%`}',
    ),
  )
  assert.ok(
    glassSurfaceSource.includes(
      'height={`${100 + filterRegionPaddingPercent * 2}%`}',
    ),
  )
})

test('the 12 new native definitions identify their exact source objects and geometry', () => {
  for (const [
    index,
    [id, displayLabel, sourcePresetKey, nativeLayout],
  ] of expectedNewBaseDefinitions.entries()) {
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id]
    assert.equal(definition.displayLabel, displayLabel)
    assert.equal(definition.sourcePresetKey, sourcePresetKey)
    assert.equal(
      definition.renderer,
      index < 6
        ? 'glass-project-app-object'
        : 'extracted-source-glass-object',
    )
    assert.deepEqual(
      [
        definition.nativeLayout.width,
        definition.nativeLayout.height,
        definition.nativeLayout.radius,
        definition.nativeLayout.geometry,
      ],
      nativeLayout,
    )
    assert.equal(definition.contentPolicy, 'object-only')
    assert.equal(definition.transparentOutside, true)
    assert.equal(definition.portalMode, 'anchored-portal')
    assert.ok(definition.sourcePath.every((path) => path.startsWith('glass-projects-lab/')))
    assert.ok(definition.sourceComponent.length > 0)
  }
})

test('each standardized duplicate changes only source-supported geometry', () => {
  const allowedConfigPaths = new Set([
    'geometry.width',
    'geometry.height',
    'geometry.cornerRadius',
    'width',
    'height',
    'radius',
    'outputMask',
    // The displacement map is a geometry-derived asset: both of these families
    // stretch an objectBoundingBox feImage over the object, so a resized object
    // needs a field generated for its own shape.
    'displacementMap',
  ])
  for (const baseId of expectedNewBasePresetIds) {
    const duplicateId = `${baseId}${STANDARDIZED_LEGACY_ID_SUFFIX}`
    const original = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[baseId]
    const duplicate = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[duplicateId]
    assert.equal(duplicate.sourceFamily, original.sourceFamily)
    assert.equal(duplicate.sourcePresetKey, original.sourcePresetKey)
    assert.equal(duplicate.sourceComponent, original.sourceComponent)
    assert.equal(duplicate.renderer, original.renderer)
    assert.deepEqual(duplicate.sourcePath, original.sourcePath)
    assert.deepEqual(duplicate.compositing, original.compositing)
    assert.deepEqual(duplicate.interactions, original.interactions)
    assert.deepEqual(duplicate.nativeLayout, {
      width: STANDARDIZED_GEOMETRY.width,
      height: STANDARDIZED_GEOMETRY.height,
      radius: STANDARDIZED_GEOMETRY.radius,
      geometry: 'rounded-rect',
    })
    assert.ok(
      !duplicate.displayLabel.includes('358'),
      `${duplicateId} label must not claim the legacy geometry`,
    )
    const configDifferences = differingLeafPaths(
      original.config,
      duplicate.config,
    )
    assert.ok(
      configDifferences.every((path) => allowedConfigPaths.has(path)),
      `${baseId}: ${configDifferences.join(', ')}`,
    )
  }
})

test('the JSON schema recognizes precisely the centralized reference-preset ids and native layout', () => {
  assert.deepEqual(schema.items.properties.e11LayerCReferencePreset.enum, expectedAllPresetIds)
  assert.deepEqual(schema.items.properties.e11LayerCLayout.required, ['width', 'height', 'radius'])
  assert.equal(schema.items.properties.e11LayerCLayout.additionalProperties, false)
  assert.ok(schema.items.properties.scope.enum.includes('eleven'))
})

test('the original 30 remain fixed and the 24 requested saves occupy the reserved block', () => {
  assert.equal(generated.length, 54)
  assert.equal(originalGenerated.length, 30)
  assert.equal(newGenerated.length, 24)
  assert.deepEqual(
    originalGenerated.map((save) => save.id),
    Array.from({ length: 30 }, (_, index) => headMaximumId + index + 1),
  )
  assert.deepEqual(
    newGenerated.map((save) => save.id),
    Array.from({ length: 24 }, (_, index) => 1068 + index),
  )
  assert.deepEqual(
    generated.map((save) => save.id),
    Array.from({ length: 54 }, (_, index) => headMaximumId + index + 1),
  )
  assert.equal(new Set(saves.map((save) => save.id)).size, saves.length)
  // The reserved block is exactly 1038–1091 and nothing else lives inside it.
  assert.deepEqual([generated[0].id, generated.at(-1).id], [1038, 1091])
  assert.equal(
    saves.filter((save) => save.id >= 1038 && save.id <= 1091).length,
    54,
    'no non-generated record may occupy the reserved reference block',
  )
})

test('each requested preset has one Save 249 clone with its exact label and native layout', () => {
  assert.deepEqual(generated.map((save) => save.e11LayerCReferencePreset), expectedAllPresetIds)
  for (const [index, save] of generated.entries()) {
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[expectedAllPresetIds[index]]
    assert.equal(save.sourceSaveId, 249)
    // Standardized duplicates are labelled as the "b" variant of the save they
    // duplicate, so the list reads 1068, 1068b, 1069, 1069b, …
    const displayId = save.displayId ?? String(save.id)
    assert.equal(
      save.label,
      `Save ${displayId} · Right overlap pane (249 base + ${definition.displayLabel})`,
    )
    assert.deepEqual(save.e11LayerCLayout, {
      width: definition.nativeLayout.width,
      height: definition.nativeLayout.height,
      radius: definition.nativeLayout.radius,
    })
    assert.equal('e11LayerCPreserveOpacity' in save, false)
    assert.equal('e11LayerCBackgroundOverride' in save, false)
    const expectedDifferences = allowedDifferences.filter(
      (key) => (key !== 'e11LayerCInitialPosition' && key !== 'displayId') || key in save,
    )
    assert.deepEqual(differingKeys(sourceSave, save), expectedDifferences)
  }
})

test('all pre-existing saves are still present and byte-for-byte JSON unchanged', () => {
  const currentById = new Map(saves.map((save) => [save.id, save]))
  assert.equal(
    saves.filter((save) => save.id <= headMaximumId).length,
    headSaves.length,
  )
  for (const headSave of headSaves) {
    assert.equal(JSON.stringify(currentById.get(headSave.id)), JSON.stringify(headSave), `Save ${headSave.id}`)
  }
  const headBody = headSavesText.slice(0, headSavesText.lastIndexOf('\n]'))
  assert.ok(savesText.startsWith(`${headBody},\n`), 'the original saves file bytes are an unchanged prefix')
})

test('protected Saves 249, 1036, and 1037 retain their exact original hashes', () => {
  const expectedHashes = new Map([
    [249, '7f1aea51affa4672d0ddc7c6cb5e542b715ee7eb7ac41b215eee3195ca381714'],
    [1036, '98be21582d5a8dbce94c8e492a1ebbc97c96ef2aa643a35da71408941da62ce5'],
    [1037, '867273597ce197a07d776e20e69dabd289d6ad43b0d7e581c06f09856b5c370e'],
  ])
  for (const [id, expectedHash] of expectedHashes) {
    const current = saves.find((save) => save.id === id)
    const original = headSaves.find((save) => save.id === id)
    assert.equal(JSON.stringify(current), JSON.stringify(original))
    assert.equal(hash(current), expectedHash)
  }
})

test('generated timestamps are deterministic and collision-free', () => {
  const timestampBase = Date.parse('2026-07-25T12:00:00.000Z')
  assert.deepEqual(
    generated.map((save) => save.savedAt),
    Array.from({ length: 54 }, (_, index) => new Date(timestampBase + index * 1000).toISOString()),
  )
  assert.equal(new Set(generated.map((save) => save.savedAt)).size, 54)
})

test('the deterministic generator reports the checked-in saves as current', () => {
  const output = execFileSync(process.execPath, ['scripts/generate-experiment-eleven-reference-saves.mjs', '--check'], {
    encoding: 'utf8',
  })
  assert.match(output, /Verified 54 deterministic Experiment Eleven reference saves/)
})

test('the machine audit compares against the pre-reference baseline', () => {
  const output = execFileSync(process.execPath, ['scripts/generate-experiment-eleven-reference-saves.mjs', '--audit'], {
    encoding: 'utf8',
  })
  const audit = JSON.parse(output)
  assert.equal(audit.newSaveCount, 54)
  assert.deepEqual(audit.newSaveIdRange, [1038, 1091])
  assert.equal(audit.labels.length, 54)
  assert.equal(audit.sourceSaveIds.length, 54)
  assert.ok(audit.sourceSaveIds.every((id) => id === 249))
  assert.deepEqual(audit.presetIds, expectedAllPresetIds)
  assert.equal(audit.nativeLayouts.length, 54)
  assert.equal(audit.duplicateIdCount, 0)
  assert.ok(audit.unexpectedDifferences.every(({ keys }) => keys.length === 0))
  assert.deepEqual(audit.modifiedExistingIds, [])
  assert.deepEqual(audit.removedExistingIds, [])
  for (const id of [249, 1036, 1037]) {
    assert.equal(audit.protectedSaves[id].unchanged, true)
    assert.equal(
      audit.protectedSaves[id].currentHash,
      audit.protectedSaves[id].baselineHash,
    )
  }
})

test('Saves 1080–1091 render at the Save 248 Layer C geometry', () => {
  const standardized = saves
    .filter((save) => save.id >= 1080 && save.id <= 1091)
    .sort((left, right) => left.id - right.id)
  assert.equal(standardized.length, 12)

  for (const save of standardized) {
    assert.deepEqual(
      save.e11LayerCLayout,
      {
        width: STANDARDIZED_GEOMETRY.width,
        height: STANDARDIZED_GEOMETRY.height,
        radius: STANDARDIZED_GEOMETRY.radius,
      },
      `Save ${save.id} layout`,
    )
    assert.equal(save.e11LayerCLayout.width, 293)
    assert.equal(save.e11LayerCLayout.height, 125)
    assert.equal(save.e11LayerCLayout.radius, 21)

    // Nothing user-visible may still advertise the legacy geometry.
    assert.ok(!save.label.includes('358×140'), `Save ${save.id} label`)
    assert.ok(!save.label.includes('r54'), `Save ${save.id} label`)

    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[save.e11LayerCReferencePreset]
    assert.deepEqual(
      [definition.nativeLayout.width, definition.nativeLayout.height, definition.nativeLayout.radius],
      [STANDARDIZED_GEOMETRY.width, STANDARDIZED_GEOMETRY.height, STANDARDIZED_GEOMETRY.radius],
      `${definition.id} native layout`,
    )
    assert.ok(!definition.displayLabel.includes('358'), `${definition.id} display label`)

    // Every geometry-dependent value inside the source-derived config must have
    // been regenerated, not merely relabelled.
    const config = definition.config
    const geometry = config.geometry ?? config
    for (const [key, expected] of [
      ['width', STANDARDIZED_GEOMETRY.width],
      ['height', STANDARDIZED_GEOMETRY.height],
    ]) {
      if (key in geometry) assert.equal(geometry[key], expected, `${definition.id} config ${key}`)
    }
    for (const key of ['radius', 'cornerRadius']) {
      if (key in geometry) {
        assert.equal(geometry[key], STANDARDIZED_GEOMETRY.radius, `${definition.id} config ${key}`)
      }
    }
  }
})

test('each native save pairs with its standardized duplicate on everything but geometry', () => {
  const permittedConfigPaths = new Set([
    'geometry.width',
    'geometry.height',
    'geometry.cornerRadius',
    'geometry.technicalInset',
    'width',
    'height',
    'radius',
    'outputMask',
    'displacementMap',
  ])

  for (let index = 0; index < 12; index += 1) {
    const nativeSave = saves.find((save) => save.id === 1068 + index)
    const duplicateSave = saves.find((save) => save.id === 1080 + index)
    assert.ok(nativeSave, `Save ${1068 + index}`)
    assert.ok(duplicateSave, `Save ${1080 + index}`)

    const nativeId = nativeSave.e11LayerCReferencePreset
    assert.equal(
      duplicateSave.e11LayerCReferencePreset,
      `${nativeId}${STANDARDIZED_LEGACY_ID_SUFFIX}`,
      `${nativeSave.id} -> ${duplicateSave.id} pairing`,
    )

    const native = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[nativeId]
    const duplicate = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[duplicateSave.e11LayerCReferencePreset]

    assert.equal(duplicate.sourceFamily, native.sourceFamily)
    assert.equal(duplicate.sourcePresetKey, native.sourcePresetKey)
    assert.equal(duplicate.sourceComponent, native.sourceComponent)
    assert.equal(duplicate.sourceRepository, native.sourceRepository)
    assert.equal(duplicate.renderer, native.renderer)
    assert.equal(duplicate.contentPolicy, native.contentPolicy)
    assert.equal(duplicate.transparentOutside, native.transparentOutside)
    assert.equal(duplicate.transparentRenderSurface, native.transparentRenderSurface)
    assert.equal(duplicate.portalMode, native.portalMode)
    assert.deepEqual(duplicate.sourcePath, native.sourcePath)
    assert.equal(duplicate.provenance, native.provenance)
    assert.deepEqual(duplicate.compositing, native.compositing)
    assert.deepEqual(duplicate.interactions, native.interactions)

    const configDifferences = differingLeafPaths(native.config, duplicate.config)
    assert.ok(
      configDifferences.every((path) => permittedConfigPaths.has(path)),
      `${nativeId}: unexpected non-geometry config drift: ${configDifferences.join(', ')}`,
    )

    // The saves themselves differ only in the generator-owned fields.
    assert.deepEqual(
      differingKeys(nativeSave, duplicateSave),
      [
        'displayId',
        'e11LayerCInitialPosition',
        'e11LayerCLayout',
        'e11LayerCReferencePreset',
        'id',
        'label',
        'savedAt',
      ],
      `${nativeSave.id} -> ${duplicateSave.id} save fields`,
    )
  }
})

test('the source-native Chromium save keeps its requested 358×140 r54 configuration', () => {
  const nativeSave = saves.find((save) => save.id === 1076)
  assert.equal(nativeSave.e11LayerCReferencePreset, 'chromium-configurable-glass:requested')
  assert.deepEqual(nativeSave.e11LayerCLayout, { width: 358, height: 140, radius: 54 })

  const native = EXPERIMENT_ELEVEN_REFERENCE_PRESETS['chromium-configurable-glass:requested']
  assert.deepEqual(
    [native.nativeLayout.width, native.nativeLayout.height, native.nativeLayout.radius],
    [358, 140, 54],
  )
  assert.equal(native.displayLabel, 'Chromium Configurable Glass · Requested preset')
})

test('Save 1086 mounts no selected-option pill', () => {
  // The source `.switcher::after` is the selected-option background: an 84px
  // pill with its own fill and shadows. The extracted object has no options and
  // no selection state, so it rendered as a stray grey pill inside the shell.
  const css = readFileSync(
    new URL('../src/vendor/reference-glass/css-liquid-glass-switcher/css-liquid-glass-switcher.css', import.meta.url),
    'utf8',
  )
  assert.match(css, /\.e11-css-liquid-glass-switcher::after[\s\S]*?content:\s*none/)
  assert.match(css, /\.e11-css-liquid-glass-switcher::(after|before)[\s\S]*?display:\s*none/)
  // No pseudo-element may declare the source pill's 84px width or its fill.
  assert.doesNotMatch(css, /width:\s*84px/)
  assert.doesNotMatch(css, /--e11-switcher-c-glass\)\s*36%/)
})

test('Saves 1086 and 1087 use a displacement field built for the rounded rectangle', () => {
  // Both families stretch an objectBoundingBox feImage across the object, so a
  // pill map / circle map produces the wrong optical shape once resized.
  const switcher = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[
    `css-liquid-glass-switcher:switcher${STANDARDIZED_LEGACY_ID_SUFFIX}`
  ]
  const dist = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[
    `liquid-glass-dist:glass${STANDARDIZED_LEGACY_ID_SUFFIX}`
  ]
  assert.equal(switcher.config.displacementMap, 'switcher-map-293x125-r21.png')
  assert.equal(dist.config.displacementMap, 'frosted-map-293x125-r21.png')

  // The source-native saves keep their authoritative source maps.
  assert.equal(
    EXPERIMENT_ELEVEN_REFERENCE_PRESETS['css-liquid-glass-switcher:switcher'].config.displacementMap,
    'switcher-map.webp',
  )
  assert.equal(
    EXPERIMENT_ELEVEN_REFERENCE_PRESETS['liquid-glass-dist:glass'].config.displacementMap,
    'frosted-map.png',
  )
})

test('button saves never enter the Experiment Set One save store', () => {
  const inButtonBlock = saves.filter((save) => save.id >= 1092 && save.id <= 1150)
  assert.deepEqual(inButtonBlock, [], 'reserved button block must be empty in Experiment Set One')
  assert.equal(
    saves.some((save) => 'experimentSetId' in save || 'layerA' in save),
    false,
    'no Button Source Experiment record may appear in the Experiment Set One store',
  )
})

test('standardized saves carry Save 248 position and not the generic centred one', () => {
  const source = saves.find((save) => save.id === 248)
  assert.ok(source?.e4, 'Save 248 is the position authority')
  const expected = {
    x: Math.max(0, Math.round((source.e4.layerBWidth - STANDARDIZED_GEOMETRY.width) / 2)),
    y: 0,
  }
  const genericY = Math.round((source.e4.layerBHeight - STANDARDIZED_GEOMETRY.height) / 2)

  for (const save of saves.filter((s) => s.id >= 1080 && s.id <= 1091)) {
    assert.deepEqual(save.e11LayerCInitialPosition, expected, `Save ${save.id}`)
    assert.notEqual(save.e11LayerCInitialPosition.y, genericY, `Save ${save.id} must not use centred y`)
  }
  // Source-native saves keep their own default placement.
  for (const save of saves.filter((s) => s.id >= 1068 && s.id <= 1079)) {
    assert.equal('e11LayerCInitialPosition' in save, false, `Save ${save.id} keeps native placement`)
  }
})

test('standardized duplicates are presented as the b variant of their native pair', () => {
  for (let index = 0; index < 12; index += 1) {
    const nativeSave = saves.find((save) => save.id === 1068 + index)
    const duplicate = saves.find((save) => save.id === 1080 + index)
    assert.equal(duplicate.displayId, `${nativeSave.id}b`, `Save ${duplicate.id} display id`)
    assert.match(duplicate.label, new RegExp(`^Save ${nativeSave.id}b · `))
    // Natives keep their plain numeric identity.
    assert.equal('displayId' in nativeSave, false, `Save ${nativeSave.id} stays plain`)
  }

  // Sorting on the display key interleaves each duplicate after its native.
  const key = (save) => {
    const match = /^(\d+)([a-z])$/.exec(save.displayId ?? '')
    return match ? [Number(match[1]), match[2].charCodeAt(0) - 96] : [save.id, 0]
  }
  const ordered = saves
    .filter((save) => save.id >= 1068 && save.id <= 1091)
    .sort((a, b) => {
      const [ab, av] = key(a)
      const [bb, bv] = key(b)
      return ab - bb || av - bv
    })
    .map((save) => save.displayId ?? String(save.id))
  assert.deepEqual(ordered.slice(0, 6), ['1068', '1068b', '1069', '1069b', '1070', '1070b'])
})
