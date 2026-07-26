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

const saves = JSON.parse(readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'))
const savesText = readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8')
const schema = JSON.parse(readFileSync(new URL('../src/data/experiment-set-one/saves.schema.json', import.meta.url), 'utf8'))
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
const generated = saves.filter((save) => save.id > headMaximumId).sort((left, right) => left.id - right.id)

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
  ['wge-next:form-submit-button', 'WGE Next · Submit Form button', 'LiquidGlassFormDemo.submitButton', 'wge-next-submit-button', [384, 38, 18, 'source-button'], '7ea079c5bbdca7326ef44ceeae7287f6a2f099664706fdd89047567bd6daaf3b'],
  ['wge-next:bottom-bar', 'WGE Next · Glass bottom bar', 'LiquidGlassDemo.bottomBar', 'wge-next-bottom-bar', [640, 60, 28, 'rounded-rect'], '62b1a27a508cbdd1456ce09ccf1b14423c2c721103d889e30b26d32d1b9e0474'],
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

const allowedDifferences = [
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

test('the registry contains the requested 30 presets exactly once and in source order', () => {
  assert.deepEqual(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS, expectedPresetIds)
  assert.equal(Object.keys(EXPERIMENT_ELEVEN_REFERENCE_PRESETS).length, 30)
  assert.equal(new Set(EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS).size, 30)
  for (const id of expectedPresetIds) {
    assert.equal(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].id, id)
    assert.ok(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].sourcePath.length > 0)
    assert.ok(EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id].provenance.length > 0)
  }
})

test('the deterministic object audit names the exact transparent root for every save', () => {
  assert.equal(EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.length, 30)
  assert.deepEqual(
    EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.map((row) => row.saveId),
    Array.from({ length: 30 }, (_, index) => headMaximumId + index + 1),
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

test('the JSON schema recognizes precisely the centralized reference-preset ids and native layout', () => {
  assert.deepEqual(schema.items.properties.e11LayerCReferencePreset.enum, expectedPresetIds)
  assert.deepEqual(schema.items.properties.e11LayerCLayout.required, ['width', 'height', 'radius'])
  assert.equal(schema.items.properties.e11LayerCLayout.additionalProperties, false)
  assert.ok(schema.items.properties.scope.enum.includes('eleven'))
})

test('exactly 30 new consecutive save ids start at the former maximum plus one', () => {
  assert.equal(generated.length, 30)
  assert.deepEqual(
    generated.map((save) => save.id),
    Array.from({ length: 30 }, (_, index) => headMaximumId + index + 1),
  )
  assert.equal(new Set(saves.map((save) => save.id)).size, saves.length)
})

test('each requested preset has one Save 249 clone with its exact label and native layout', () => {
  assert.deepEqual(generated.map((save) => save.e11LayerCReferencePreset), expectedPresetIds)
  for (const [index, save] of generated.entries()) {
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[expectedPresetIds[index]]
    assert.equal(save.sourceSaveId, 249)
    assert.equal(
      save.label,
      `Save ${save.id} · Right overlap pane (249 base + ${definition.displayLabel})`,
    )
    assert.deepEqual(save.e11LayerCLayout, {
      width: definition.nativeLayout.width,
      height: definition.nativeLayout.height,
      radius: definition.nativeLayout.radius,
    })
    assert.equal('e11LayerCPreserveOpacity' in save, false)
    assert.equal('e11LayerCBackgroundOverride' in save, false)
    assert.deepEqual(differingKeys(sourceSave, save), allowedDifferences)
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
    Array.from({ length: 30 }, (_, index) => new Date(timestampBase + index * 1000).toISOString()),
  )
  assert.equal(new Set(generated.map((save) => save.savedAt)).size, 30)
})

test('the deterministic generator reports the checked-in saves as current', () => {
  const output = execFileSync(process.execPath, ['scripts/generate-experiment-eleven-reference-saves.mjs', '--check'], {
    encoding: 'utf8',
  })
  assert.match(output, /Verified 30 deterministic Experiment Eleven reference saves/)
})

test('the machine audit compares against the pre-reference baseline', () => {
  const output = execFileSync(process.execPath, ['scripts/generate-experiment-eleven-reference-saves.mjs', '--audit'], {
    encoding: 'utf8',
  })
  const audit = JSON.parse(output)
  assert.equal(audit.newSaveCount, 30)
  assert.deepEqual(audit.newSaveIdRange, [1038, 1067])
  assert.equal(audit.labels.length, 30)
  assert.equal(audit.sourceSaveIds.length, 30)
  assert.ok(audit.sourceSaveIds.every((id) => id === 249))
  assert.deepEqual(audit.presetIds, expectedPresetIds)
  assert.equal(audit.nativeLayouts.length, 30)
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
