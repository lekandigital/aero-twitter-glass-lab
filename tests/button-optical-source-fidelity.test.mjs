import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  LIQUID_GLASS_JS_SOURCE_ADAPTATIONS,
  adaptLiquidGlassJsContainerSource,
} from '../src/components/button-experiment-set/renderers/liquidGlassJsSourceAdapter.ts'
import {
  REFERENCE_BUTTON_PRESETS_BY_ID,
} from '../src/components/button-experiment-set/registry.ts'

const opticalSource = readFileSync(
  new URL('../src/components/button-experiment-set/renderers/optical.tsx', import.meta.url),
  'utf8',
)
const buttonCss = readFileSync(
  new URL('../src/styles/button-experiment-set.css', import.meta.url),
  'utf8',
)
const exactContainerSource = readFileSync(
  new URL(
    '../_reference_vault/reference-library/github/liquid-glass-js/container.js',
    import.meta.url,
  ),
  'utf8',
)

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function functionSource(name, nextName) {
  const start = opticalSource.indexOf(`export function ${name}`)
  const end = opticalSource.indexOf(`export function ${nextName}`, start)
  assert.notEqual(start, -1, `${name} source`)
  assert.notEqual(end, -1, `${nextName} boundary`)
  return opticalSource.slice(start, end)
}

function shader(source, name) {
  const marker = `const ${name} = \``
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `${name} shader start`)
  const contentStart = start + marker.length
  const end = source.indexOf('`', contentStart)
  assert.notEqual(end, -1, `${name} shader end`)
  return source.slice(contentStart, end)
}

test('Groups M–O encode the complete authoritative optical configs', () => {
  const wge = REFERENCE_BUTTON_PRESETS_BY_ID['wge-next:nav-top']
  assert.deepEqual(wge.options, {
    blur: 0,
    refractiveIndex: 1.4,
    hoverBlur: 1.5,
    hoverRefractiveIndex: 3,
    glassThickness: 110,
    bezelWidth: 20,
    specularOpacity: 0.9,
    spring: { stiffness: 300, damping: 30 },
    backgroundOpacity: 0.2,
    hoverBackgroundOpacity: 0.35,
    iconColor: 'rgb(0 0 0 / 80%)',
  })

  for (const [id, expected] of [
    ['web-glass:nav-default', { state: 'default', refractiveIndex: 1.4, blur: 0 }],
    ['web-glass:nav-hovered', { state: 'hovered', refractiveIndex: 3, blur: 1.5 }],
  ]) {
    assert.deepEqual(REFERENCE_BUTTON_PRESETS_BY_ID[id].options, {
      ...expected,
      glassThickness: 110,
      bezelWidth: 20,
      specularOpacity: 0.9,
      specularSaturation: 4,
      surface: 'CONVEX',
      width: 52,
      height: 52,
      radius: 26,
      dpr: 1,
      scaleRatio: 1,
      canvasPad: 0,
    })
  }

  assert.deepEqual(
    REFERENCE_BUTTON_PRESETS_BY_ID['pure-css-ios26:glass-button'].options,
    {
      primitiveUnits: 'objectBoundingBox',
      mapWidth: 200,
      mapHeight: 200,
      mapSha256: '0dab2624648a6d2cae916e832055a21a3f205cb78182ac1d857509e739639de2',
      blur: 0.02,
      displacementScale: 1,
      channels: 'R/G',
    },
  )
})

test('Groups M and N retain source-only hover semantics', () => {
  const wge = functionSource('WgeNextButton', 'WebGlassNavButton')
  assert.match(wge, /useSpring\(0, \{ stiffness: 300, damping: 30 \}\)/)
  assert.match(wge, /useSpring\(1\.4, \{ stiffness: 300, damping: 30 \}\)/)
  assert.match(wge, /blur\.set\(hovered \? 1\.5 : 0\)/)
  assert.match(wge, /refractiveIndex\.set\(hovered \? 3 : 1\.4\)/)
  assert.match(buttonCss, /\.button-src-wge\s*\{[\s\S]*color: rgba\(0,0,0,\.8\)/)
  assert.match(buttonCss, /\.button-src-wge:hover\s*\{[\s\S]*background: rgba\(255,255,255,\.35\)/)
  assert.doesNotMatch(
    buttonCss.match(/\.button-src-wge\s*\{([\s\S]*?)\}/)?.[1] ?? '',
    /transition:/,
  )

  const webGlass = functionSource('WebGlassNavButton', 'Ios26FilteredButton')
  for (const exactProp of [
    'canvasWidth={52}',
    'canvasHeight={52}',
    'specularSaturation={4}',
    'bezelHeightFn={CONVEX.fn}',
    'scaleRatio={scaleRatio}',
    'dpr={1}',
  ]) {
    assert.ok(webGlass.includes(exactProp), exactProp)
  }
  assert.match(webGlass, /refractiveIndex=\{hovered \? 3 : 1\.4\}/)
  assert.match(webGlass, /blur=\{hovered \? 1\.5 : 0\}/)
  assert.doesNotMatch(webGlass, /SourceLiquidGlass|is-hovered|background/)
  assert.doesNotMatch(buttonCss, /\.button-src-web-glass\.is-hovered/)
  assert.match(
    buttonCss,
    /\.button-src-web-glass\s*\{[\s\S]*background: transparent;/,
  )
})

test('Group O uses the exact embedded-map graph and source button structure', () => {
  const ios26 = functionSource('Ios26FilteredButton', 'LiquidGlassJsButton')
  assert.match(ios26, /primitiveUnits="objectBoundingBox"/)
  assert.match(ios26, /liquid-glass-dist\/frosted-map\.png/)
  assert.match(ios26, /<feGaussianBlur in="SourceGraphic" stdDeviation="0\.02" result="blur"/)
  assert.match(ios26, /<feDisplacementMap[\s\S]*in="blur"[\s\S]*in2="map"[\s\S]*scale="1"/)
  assert.doesNotMatch(ios26, /feTurbulence|<Plus|<span/)
  assert.match(ios26, /<path d="M5 12h14" \/>/)
  assert.match(ios26, /<path d="M12 5v14" \/>/)
  assert.match(buttonCss, /\.button-src-ios26::before/)
  assert.match(buttonCss, /\.button-src-ios26::after/)
  assert.match(buttonCss, /filter: var\(--button-ios26-filter\)/)

  const map = readFileSync(
    new URL(
      '../public/vendor/reference-glass/liquid-glass-dist/frosted-map.png',
      import.meta.url,
    ),
  )
  assert.equal(
    sha256(map),
    '0dab2624648a6d2cae916e832055a21a3f205cb78182ac1d857509e739639de2',
  )
})

test('Group P adapts exact source only at audited integration seams', () => {
  const sourceFiles = [
    ['container.js', '7080217b7fb7e422d2b1f4043342d34fddafaed0a91b54d3f9105361c0f70d65'],
    ['button.js', 'e8dbc8e96f4f8f0c64da4184e9b341776d8adedd42d788b92f9ad7049a9306e6'],
    ['glass.css', '99dc2ee94be1e5d76402b3acdb3fe807332f533ef5be71721d5ed022b98fc813'],
    ['demo.js', '5ffa1208c4ec23649ab0566ec2d9a5d28391fcb5931899bbd071fa2403dee901'],
  ]
  for (const [file, expectedHash] of sourceFiles) {
    const bytes = readFileSync(
      new URL(
        `../_reference_vault/reference-library/github/liquid-glass-js/${file}`,
        import.meta.url,
      ),
    )
    assert.equal(sha256(bytes), expectedHash, file)
  }

  const adapted = adaptLiquidGlassJsContainerSource(exactContainerSource)
  for (const adaptation of LIQUID_GLASS_JS_SOURCE_ADAPTATIONS) {
    assert.ok(adapted.includes(adaptation.replacement), adaptation.label)
  }
  let restored = adapted
  for (const adaptation of [...LIQUID_GLASS_JS_SOURCE_ADAPTATIONS].reverse()) {
    const first = restored.indexOf(adaptation.replacement)
    assert.notEqual(first, -1, adaptation.label)
    assert.equal(
      restored.indexOf(adaptation.replacement, first + adaptation.replacement.length),
      -1,
      `${adaptation.label} remains unique`,
    )
    restored = restored.replace(adaptation.replacement, adaptation.target)
  }
  assert.equal(restored, exactContainerSource)
  assert.equal(shader(adapted, 'vsSource'), shader(exactContainerSource, 'vsSource'))
  assert.equal(shader(adapted, 'fsSource'), shader(exactContainerSource, 'fsSource'))

  assert.match(opticalSource, /text: '▶'[\s\S]*size: '32'[\s\S]*type: 'circle'/)
  assert.match(opticalSource, /warp: false[\s\S]*tintOpacity: 0\.2/)
  assert.match(
    buttonCss,
    /\.button-src-liquid-js-host > \.glass-button\s*\{[\s\S]*box-shadow: 0 25px 50px rgba\(0,0,0,\.25\)/,
  )
  assert.doesNotMatch(
    buttonCss.match(/\.button-src-liquid-js-host \.glass-button-text\s*\{([\s\S]*?)\}/)?.[1] ?? '',
    /text-shadow/,
  )
})
