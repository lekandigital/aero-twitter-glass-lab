import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
  LIQUID_GLASS_WEB_SOURCE_COMPONENTS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'

const saves = JSON.parse(
  readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'),
)
const adapterSource = readFileSync(
  new URL('../src/vendor/reference-glass/liquid-glass-web-react/LiquidGlassReferencePreset.tsx', import.meta.url),
  'utf8',
)
const adapterCss = readFileSync(
  new URL('../src/vendor/reference-glass/liquid-glass-web-react/reference-preset.css', import.meta.url),
  'utf8',
)
const engineSource = readFileSync(
  new URL('../src/vendor/reference-glass/liquid-glass-web-react/core/engine.ts', import.meta.url),
  'utf8',
)
const liquidGlassSource = readFileSync(
  new URL('../src/vendor/reference-glass/liquid-glass-web-react/react/LiquidGlass.tsx', import.meta.url),
  'utf8',
)

const expected = [
  [1045, 'liquid-web:apple', 'PRESETS.Apple', 'Playground.LiquidGlass', 220, 220, 110],
  [1046, 'liquid-web:library-default', 'PRESETS.Library default', 'Playground.LiquidGlass', 220, 220, 110],
  [1047, 'liquid-web:fishbowl', 'PRESETS.Fishbowl', 'Playground.LiquidGlass', 220, 220, 110],
  [1048, 'liquid-web:frosted', 'PRESETS.Frosted', 'Playground.LiquidGlass', 300, 190, 40],
  [1049, 'liquid-web:prism', 'PRESETS.Prism', 'Playground.LiquidGlass', 240, 240, 120],
  [1050, 'liquid-web:flat-pane', 'PRESETS.Flat pane', 'Playground.LiquidGlass', 260, 260, 20],
  [1051, 'liquid-web:hero-circle', 'PRESETS.Hero circle / DEMO_LENSES.hero', 'GripLens', 200, 200, 100],
  [1052, 'liquid-web:reading-glass', 'PRESETS.Reading glass / DEMO_LENSES.reading', 'Primitives.ReadingGlass', 150, 150, 75],
  [1053, 'liquid-web:orbit', 'PRESETS.Orbit / DEMO_LENSES.orbit', 'Motion.LiquidGlass', 170, 170, 85],
  [1054, 'liquid-web:engine-panel', 'PRESETS.Engine panel / DEMO_LENSES.engine', 'LiquidGlassEngine', 160, 160, 80],
]

const expectedSourceContexts = new Map([
  ['liquid-web:apple', [768, 460, 274, 120]],
  ['liquid-web:library-default', [768, 460, 274, 120]],
  ['liquid-web:fishbowl', [768, 460, 274, 120]],
  ['liquid-web:frosted', [768, 460, 234, 135]],
  ['liquid-web:prism', [768, 460, 264, 110]],
  ['liquid-web:flat-pane', [768, 460, 254, 100]],
  ['liquid-web:hero-circle', [1188, 575.625, 779.12, 256.8875]],
  ['liquid-web:reading-glass', [1078, 209.5, 464, 29.75]],
  ['liquid-web:orbit', [768, 420, 299, 234.1192008768]],
  ['liquid-web:engine-panel', [768, 380, 188.8, 110]],
])

test('Saves 1045–1054 map in order to the exact custom-demo presets and roots', () => {
  for (const [saveId, presetId, sourceKey, sourceComponent, width, height, radius] of expected) {
    const save = saves.find((candidate) => candidate.id === saveId)
    const preset = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
    assert.equal(save.e11LayerCReferencePreset, presetId, `Save ${saveId}`)
    assert.equal(preset.sourcePresetKey, sourceKey, presetId)
    assert.equal(LIQUID_GLASS_WEB_SOURCE_COMPONENTS[presetId], sourceComponent, presetId)
    assert.deepEqual(
      [preset.nativeLayout.width, preset.nativeLayout.height, preset.nativeLayout.radius],
      [width, height, radius],
      presetId,
    )
    assert.equal(preset.compositing.strategy, 'transparent-page-portal-backdrop-filter', presetId)
    assert.equal(preset.compositing.samplingSource, 'live-experiment-composition', presetId)
    assert.equal(preset.compositing.pageLevelPortal, true, presetId)
    assert.deepEqual(
      [
        preset.sourceContext.width,
        preset.sourceContext.height,
        preset.sourceContext.lensOffsetX,
        preset.sourceContext.lensOffsetY,
      ],
      expectedSourceContexts.get(presetId),
      `${presetId} source filter coordinate box`,
    )
  }
})

test('the custom-demo adapter paints no source bed and exposes transparent object metadata', () => {
  for (const forbidden of [
    'function ReferenceBed',
    '<ReferenceBed',
    'hero-inner',
    'bed--chart',
    'bed--grid',
    'bed--text',
    'engineBed',
    'linear-gradient',
    'radial-gradient',
  ]) {
    assert.equal(adapterSource.includes(forbidden), false, forbidden)
    assert.equal(adapterCss.includes(forbidden), false, forbidden)
  }
  assert.equal(adapterSource.includes('function ObjectGlass'), false)
  assert.match(adapterSource, /import\s*\{[\s\S]*LiquidGlass,[\s\S]*LiquidGlassHandle[\s\S]*\}\s*from "\.\/react\/LiquidGlass"/)
  assert.match(adapterSource, /<LiquidGlass/)
  assert.match(adapterSource, /data-liquid-glass-filter-application="backdrop-filter"/)
  assert.match(engineSource, /dataset\.liquidGlassFilterApplication/)
  assert.match(adapterSource, /data-transparent-render-surface="true"/)
  assert.match(adapterSource, /data-source-demo-background="absent"/)
  assert.match(adapterSource, /data-source-preset-key=\{sourcePresetKey\}/)
  assert.match(adapterSource, /data-source-component=\{sourceComponent\}/)
  assert.match(adapterSource, /data-source-component-implementation=/)
  assert.match(adapterSource, /data-source-context-width=\{contextWidth\}/)
  assert.match(adapterSource, /data-source-context-height=\{contextHeight\}/)
  assert.match(adapterCss, /\.e11-liquid-web-reference\s*\{[^}]*background: transparent/s)
  assert.match(adapterCss, /\.e11-liquid-web-reference > div:first-of-type\s*\{[^}]*background: transparent/s)
  assert.match(adapterCss, /\.e11-liquid-web-reference__transparent-source\s*\{[^}]*background: transparent/s)
  assert.match(adapterCss, /\.e11-liquid-web-reference__source-grip\s*\{[^}]*background: transparent/s)
  assert.match(adapterSource, /SOURCE_GRIP_LAYER_C_INSET = 8/)
  assert.equal(
    createHash('sha256').update(liquidGlassSource).digest('hex'),
    'dd534d17c2d8806ea42c1540ffc8da9477964a92788b5a40f6231432d19c11d6',
    'the mounted React component remains byte-identical to the authoritative library source',
  )
})
