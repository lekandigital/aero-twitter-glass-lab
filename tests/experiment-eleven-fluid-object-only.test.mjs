import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'
import {
  DEMO_CONFIGS,
  FLUID_GLASS_REFERENCE_OBJECTS,
} from '../src/vendor/reference-glass/fluid-glass/config.ts'

const saves = JSON.parse(
  readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'),
)

const expected = [
  [1040, 'fluid-glass:lens', 'DEMO_CONFIGS.lensDefault', 'lens', 'Cylinder', 'lens.glb'],
  [1041, 'fluid-glass:frosted', 'DEMO_CONFIGS.frosted', 'lens', 'Cylinder', 'lens.glb'],
  [1042, 'fluid-glass:bar', 'DEMO_CONFIGS.barDefault', 'bar', 'Cube', 'bar.glb'],
  [1043, 'fluid-glass:diamond', 'DEMO_CONFIGS.diamond', 'cube', 'Cube', 'cube.glb'],
  [1044, 'fluid-glass:fluid', 'DEMO_CONFIGS.fluid', 'lens', 'Cylinder', 'lens.glb'],
]

test('Saves 1040–1044 map one-to-one to the authoritative FluidGlass objects', () => {
  for (const [saveId, presetId, sourceKey, mode, geometryKey, assetName] of expected) {
    const save = saves.find((candidate) => candidate.id === saveId)
    const preset = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
    const sourceObject = FLUID_GLASS_REFERENCE_OBJECTS[sourceKey]
    const authoritativeConfig = DEMO_CONFIGS[sourceKey.slice('DEMO_CONFIGS.'.length)]

    assert.equal(save.e11LayerCReferencePreset, presetId, `Save ${saveId} preset`)
    assert.equal(preset.sourcePresetKey, sourceKey, `Save ${saveId} source key`)
    assert.deepEqual(
      { mode: preset.config.mode, props: preset.config.props },
      { mode: authoritativeConfig.mode, props: authoritativeConfig.props },
      `Save ${saveId} complete source config`,
    )
    assert.equal(sourceObject.mode, mode, `Save ${saveId} source component mode`)
    assert.equal(sourceObject.geometryKey, geometryKey, `Save ${saveId} source geometry`)
    assert.ok(sourceObject.glb.endsWith(`/assets/3d/${assetName}`), `Save ${saveId} exact GLB`)
    assert.equal(sourceObject.transparentRenderSurface, true, `Save ${saveId} transparent surface`)
    assert.equal(sourceObject.visibleSourceStage, false, `Save ${saveId} source stage`)
    assert.match(sourceObject.sourceComponent, new RegExp(`FluidGlass/${mode === 'cube' ? 'Cube' : mode[0].toUpperCase() + mode.slice(1)}/`))
    assert.deepEqual(
      [preset.nativeLayout.width, preset.nativeLayout.height, preset.nativeLayout.radius],
      [320, 240, 10],
      `Save ${saveId} native gallery geometry`,
    )
  }
})

test('the FluidGlass adapter exposes an object-only transparent render path', () => {
  const implementation = readFileSync(
    new URL('../src/vendor/reference-glass/fluid-glass/FluidGlass.tsx', import.meta.url),
    'utf8',
  )
  const styles = readFileSync(
    new URL('../src/vendor/reference-glass/fluid-glass/FluidGlass.css', import.meta.url),
    'utf8',
  )

  assert.match(implementation, /transparentObjectOnly/)
  assert.match(implementation, /!transparentObjectOnly && \(/)
  assert.match(implementation, /data-transparent-render-surface=/)
  assert.match(implementation, /data-source-demo-background-mounted="false"/)
  assert.match(implementation, /data-source-stage-mounted=/)
  assert.match(implementation, /data-source-component=/)
  assert.match(styles, /\.e11-ref-fluid-glass-stage[\s\S]*background: transparent;/)
  assert.match(styles, /\.e11-ref-fluid-glass-stage canvas[\s\S]*background: transparent !important;/)
})
