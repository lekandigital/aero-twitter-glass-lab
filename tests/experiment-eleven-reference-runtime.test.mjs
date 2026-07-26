import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { test } from 'node:test'
import {
  EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT,
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const saves = JSON.parse(
  readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'),
)
const referenceSaves = saves
  .filter((save) => save.id >= 1038 && save.id <= 1091)
  .sort((left, right) => left.id - right.id)
const save249 = saves.find((save) => save.id === 249)
const host = '127.0.0.1'
const port = 41787
const baseUrl = `http://${host}:${port}`
const sourceAssetDirectory = fileURLToPath(
  new URL('../public/vendor/reference-glass', import.meta.url),
)
const mountedFamilySelector = [
  '[data-e11-reference-object-root]',
].join(', ')

const forbiddenSourceSceneSelector = [
  '[data-e11-reference-backdrop]',
  '.experiment-eleven-reference-backdrop',
  '.e11-liquidgl-snapshot',
  '.e11-wge-form',
  '.e11-liquid-web-reference__bed',
  '[data-source-demo-background-mounted="true"]',
  '[data-source-stage-mounted="true"]',
  '[data-source-demo-background]:not([data-source-demo-background="absent"])',
].join(', ')

function collectRelativeFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory()
      ? collectRelativeFiles(`${directory}/${entry.name}`, relativePath)
      : [relativePath]
  })
}

async function assertPortFree() {
  await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', (error) => {
      reject(new Error(`Runtime-test port ${port} is unavailable: ${error.message}`))
    })
    probe.listen(port, host, () => {
      probe.close((error) => (error ? reject(error) : resolve()))
    })
  })
}

function buildProductionTarget() {
  execFileSync('npm', ['run', 'build'], {
    cwd: repositoryRoot,
    env: { ...process.env, NO_COLOR: '1' },
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
}

function startVite(command) {
  const output = []
  const child = spawn(
    process.execPath,
    [
      `${repositoryRoot}/node_modules/vite/bin/vite.js`,
      ...(command === 'preview' ? ['preview'] : []),
      '--host',
      host,
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      cwd: repositoryRoot,
      env: { ...process.env, BROWSER: 'none', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  const remember = (chunk) => {
    output.push(chunk.toString())
    if (output.length > 80) output.shift()
  }
  child.stdout.on('data', remember)
  child.stderr.on('data', remember)
  return { child, output }
}

async function stopProcess(child) {
  if (child.exitCode != null || child.signalCode != null) return
  child.kill('SIGTERM')
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
  if (child.exitCode == null && child.signalCode == null) child.kill('SIGKILL')
}

async function waitForServer(child, output) {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (child.exitCode != null) {
      throw new Error(`Vite exited with ${child.exitCode}\n${output.join('')}`)
    }
    try {
      const response = await fetch(`${baseUrl}/experiment-set-1`)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Timed out waiting for Vite\n${output.join('')}`)
}

async function waitUntil(predicate, description, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(
    `Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ''}`,
  )
}

function saveAriaLabel(save) {
  return save.label
}

function auditRowForPreset(presetId) {
  const row = EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT.find(
    (candidate) => candidate.presetId === presetId,
  )
  assert.ok(row, `${presetId} audit row`)
  return row
}

async function readLayerBState(page) {
  const layerB = page.getByRole('region', {
    name: 'Experiment Eleven layer B',
    exact: true,
  })
  assert.equal(await layerB.count(), 1, 'one Experiment Eleven Layer B')
  return layerB.evaluate((element) => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return {
      opacity: style.opacity,
      clipPath: style.clipPath,
      background: style.background,
      backgroundColor: style.backgroundColor,
      display: style.display,
      visibility: style.visibility,
      inlineClipPath: element.style.clipPath,
      rect: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
    }
  })
}

async function assertObjectOnlyCompositing(page, presetId, preset, layerBBaseline) {
  const row = auditRowForPreset(presetId)
  const root = page.locator(
    `[data-e11-reference-object-root="${presetId}"]`,
  )
  assert.equal(await root.count(), 1, `${presetId} exact object root count`)
  assert.equal(await root.getAttribute('data-source-family'), row.sourceFamily)
  assert.equal(await root.getAttribute('data-source-preset-key'), row.sourcePresetKey)
  assert.equal(await root.getAttribute('data-source-component'), row.sourceComponent)
  assert.equal(await root.getAttribute('data-transparent-render-surface'), 'true')
  assert.equal(await page.locator(forbiddenSourceSceneSelector).count(), 0)

  const overlays = page.locator(
    `[data-e11-reference-overlay][data-e11-reference-preset="${presetId}"]`,
  )
  if (row.portalRequired) {
    assert.equal(await overlays.count(), 1, `${presetId} one required portal`)
    const transparentPortalNodes = overlays.locator(
      '.experiment-eleven-reference-host, .experiment-eleven-reference-renderer',
    )
    for (let index = 0; index < await transparentPortalNodes.count(); index += 1) {
      assert.equal(
        await transparentPortalNodes.nth(index).evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        'rgba(0, 0, 0, 0)',
        `${presetId} portal node ${index} transparent`,
      )
    }
  } else {
    assert.equal(await overlays.count(), 0, `${presetId} has no page portal`)
  }

  const canvases = root.locator('canvas')
  for (let index = 0; index < await canvases.count(); index += 1) {
    assert.equal(
      await canvases.nth(index).evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
      'rgba(0, 0, 0, 0)',
      `${presetId} canvas ${index} transparent`,
    )
  }

  const layerB = await readLayerBState(page)
  assert.deepEqual(
    {
      opacity: layerB.opacity,
      clipPath: layerB.clipPath,
      background: layerB.background,
      backgroundColor: layerB.backgroundColor,
      display: layerB.display,
      visibility: layerB.visibility,
      inlineClipPath: layerB.inlineClipPath,
    },
    {
      opacity: layerBBaseline.opacity,
      clipPath: layerBBaseline.clipPath,
      background: layerBBaseline.background,
      backgroundColor: layerBBaseline.backgroundColor,
      display: layerBBaseline.display,
      visibility: layerBBaseline.visibility,
      inlineClipPath: layerBBaseline.inlineClipPath,
    },
    `${presetId} Layer B paint/clip/opacity unchanged`,
  )
  assert.equal(layerB.opacity, '1')
  assert.equal(layerB.clipPath, 'none')
  assert.notEqual(layerB.display, 'none')
  assert.notEqual(layerB.visibility, 'hidden')

  const anchor = page.locator(`[data-e11-reference-anchor="${presetId}"]`)
  const underlayVisibleAtOverlap = await anchor.evaluate((anchorElement) => {
    const layerBElement = document.querySelector(
      '[role="region"][aria-label="Experiment Eleven layer B"]',
    )
    if (!layerBElement) return false
    const anchorRect = anchorElement.getBoundingClientRect()
    const layerBRect = layerBElement.getBoundingClientRect()
    const left = Math.max(anchorRect.left, layerBRect.left)
    const right = Math.min(anchorRect.right, layerBRect.right)
    const top = Math.max(anchorRect.top, layerBRect.top)
    const bottom = Math.min(anchorRect.bottom, layerBRect.bottom)
    if (right <= left || bottom <= top) return false
    const elements = document.elementsFromPoint((left + right) / 2, (top + bottom) / 2)
    return elements.includes(layerBElement)
  })
  assert.equal(underlayVisibleAtOverlap, true, `${presetId} Layer B remains under Layer C`)
  assert.equal(preset.transparentRenderSurface, true)
}

async function assertUniqueE11Ids(page) {
  const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
    const ids = elements
      .map((element) => element.id)
      .filter((id) => id.startsWith('e11-'))
    return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  })
  assert.deepEqual(duplicateIds, [])

  const duplicateFilterIds = await page.locator('svg filter[id]').evaluateAll((filters) => {
    const ids = filters.map((filter) => filter.id)
    return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  })
  assert.deepEqual(duplicateFilterIds, [])
}

async function assertNativeAnchor(page, presetId, nativeLayout) {
  const anchor = page.locator(`[data-e11-reference-anchor="${presetId}"]`)
  await anchor.waitFor({ state: 'visible' })
  assert.equal(await anchor.count(), 1)
  const geometry = await anchor.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      width: Number.parseFloat(style.width),
      height: Number.parseFloat(style.height),
      radius: Number.parseFloat(style.borderRadius),
    }
  })
  assert.ok(Math.abs(geometry.width - nativeLayout.width) <= 0.02, `${presetId} width`)
  assert.ok(Math.abs(geometry.height - nativeLayout.height) <= 0.02, `${presetId} height`)
  assert.ok(Math.abs(geometry.radius - nativeLayout.radius) <= 0.02, `${presetId} radius`)
}

async function assertFamilyStructure(page, presetId, preset) {
  const row = auditRowForPreset(presetId)
  const overlay = page.locator(
    `[data-e11-reference-overlay][data-e11-reference-preset="${presetId}"]`,
  )
  const fluidRoot = page.locator(
    `.e11-ref-fluid-glass-stage[data-e11-reference-preset="${presetId}"]`,
  )

  if (preset.renderer === 'fluid-glass-r3f') {
    await fluidRoot.waitFor({ state: 'visible', timeout: 15_000 })
    assert.equal(await overlay.count(), 0)
    assert.equal(await fluidRoot.count(), 1)
    assert.equal(await fluidRoot.locator('canvas').count(), 1)
    assert.equal(await fluidRoot.getAttribute('data-fluid-glass-mode'), preset.config.mode)
    assert.match(
      await fluidRoot.getAttribute('data-fluid-glass-glb'),
      new RegExp(`/assets/3d/${preset.config.mode === 'cube' ? 'cube' : preset.config.mode}\\.glb$`),
    )
    assert.equal(await fluidRoot.getAttribute('data-source-component'), row.sourceComponent)
    assert.equal(await fluidRoot.getAttribute('data-source-demo-background-mounted'), 'false')
    assert.equal(await fluidRoot.getAttribute('data-source-stage-mounted'), 'false')
    assert.equal(
      await fluidRoot.locator('canvas').evaluate((canvas) => {
        const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
        return context?.getContextAttributes()?.alpha ?? false
      }),
      true,
      `${presetId} WebGL alpha channel`,
    )
  } else {
    await overlay.waitFor({ state: 'attached', timeout: 15_000 })
    assert.equal(await overlay.count(), 1)
    assert.equal(await overlay.getAttribute('data-e11-reference-family'), preset.sourceFamily)
    assert.equal(await overlay.getAttribute('data-e11-reference-renderer'), preset.renderer)
    const hostNode = overlay.locator('.experiment-eleven-reference-host')
    if (preset.renderer !== 'liquidgl-webgl') {
      assert.equal(await hostNode.count(), 1)
      assert.equal(
        Number(await hostNode.getAttribute('data-e11-reference-native-width')),
        preset.nativeLayout.width,
      )
      assert.equal(
        Number(await hostNode.getAttribute('data-e11-reference-native-height')),
        preset.nativeLayout.height,
      )
    }
  }

  if (preset.renderer === 'liquid-main-svg-filter') {
    const root = page.locator(`[data-e11-liquid-main-preset="${presetId}"]`)
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('svg filter[id] feDisplacementMap').count(), 1)
  } else if (preset.renderer === 'web-glass-svg-filter') {
    const root = page.locator(`[data-e11-web-glass-preset="${presetId}"]`)
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('svg filter[id] feDisplacementMap').count(), 1)
  } else if (preset.renderer === 'glass-surface-svg-filter') {
    const root = page.locator(`.e11-ref-glass-surface[data-e11-reference-preset="${presetId}"]`)
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('svg filter[id] feDisplacementMap').count(), 3)
    assert.equal(
      await root.getAttribute('data-source-preset-key'),
      preset.sourcePresetKey,
    )
  } else if (preset.renderer === 'liquid-glass-web-react') {
    const root = page.locator('.e11-liquid-web-reference')
    const isRawEngine = presetId === 'liquid-web:engine-panel'
    const filtered = isRawEngine
      ? root.locator(':scope > .e11-liquid-web-reference__transparent-source')
      : root.locator(':scope > div').first()
    const transparentSource = isRawEngine
      ? filtered
      : root.locator(
        ':scope > div:first-of-type > .e11-liquid-web-reference__transparent-source',
      )
    const sourceGrip = root.locator(
      '.e11-liquid-web-reference__source-grip',
    )
    const shadow = root.locator(':scope > div[aria-hidden="true"]').last()
    assert.equal(await root.count(), 1)
    assert.equal(
      await root.getAttribute(
        isRawEngine ? 'data-liquid-glass-engine' : 'data-liquid-glass',
      ),
      '',
    )
    assert.equal(await root.getAttribute('data-liquid-glass-width'), String(preset.nativeLayout.width))
    assert.equal(await root.getAttribute('data-liquid-glass-height'), String(preset.nativeLayout.height))
    assert.equal(
      await root.getAttribute('data-source-component-implementation'),
      isRawEngine
        ? 'core/LiquidGlassEngine'
        : 'react/LiquidGlass',
    )
    assert.equal(
      Number(await root.getAttribute('data-source-context-width')),
      preset.sourceContext.width,
    )
    assert.equal(
      Number(await root.getAttribute('data-source-context-height')),
      preset.sourceContext.height,
    )
    await waitUntil(
      async () => (await root.locator('filter[id]').count()) >= 1,
      `${presetId} generated SVG filter`,
    )
    assert.equal(await root.getAttribute('data-source-demo-background'), 'absent')
    assert.equal(await transparentSource.count(), 1)
    assert.equal(
      await sourceGrip.count(),
      isRawEngine ? 1 : 0,
      `${presetId} source-only interaction grip`,
    )
    if (await sourceGrip.count()) {
      assert.equal(
        await sourceGrip.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        'rgba(0, 0, 0, 0)',
      )
    }
    assert.equal(await filtered.count(), 1)
    assert.equal(await shadow.count(), 1)
    assert.equal(
      await root.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgba(0, 0, 0, 0)',
    )
    assert.equal(
      await filtered.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgba(0, 0, 0, 0)',
    )
    assert.equal(
      await transparentSource.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
      'rgba(0, 0, 0, 0)',
    )
    assert.match(
      await filtered.evaluate((element) => getComputedStyle(element).backdropFilter),
      /url\(/,
    )
    const sourceBox = await filtered.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        width: Number.parseFloat(style.width),
        height: Number.parseFloat(style.height),
      }
    })
    assert.ok(
      Math.abs(sourceBox.width - preset.sourceContext.width) <= 0.02,
      `${presetId} source filter width`,
    )
    assert.ok(
      Math.abs(sourceBox.height - preset.sourceContext.height) <= 0.02,
      `${presetId} source filter height`,
    )
    const shadowBox = await shadow.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        width: Number.parseFloat(style.width),
        height: Number.parseFloat(style.height),
      }
    })
    assert.ok(
      Math.abs(shadowBox.width - preset.nativeLayout.width) <= 0.02,
      `${presetId} source lens width`,
    )
    assert.ok(
      Math.abs(shadowBox.height - preset.nativeLayout.height) <= 0.02,
      `${presetId} source lens height`,
    )
    const sourceTransform = () =>
      shadow.evaluate((element) => getComputedStyle(element).transform)
    const beforeSourceInteraction = await sourceTransform()
    if (
      presetId === 'liquid-web:hero-circle' ||
      presetId === 'liquid-web:orbit'
    ) {
      assert.equal(
        await root.getAttribute('data-autonomous-motion'),
        'disabled',
        `${presetId} source-demo motion disabled`,
      )
      const rootBox = await root.boundingBox()
      assert.ok(rootBox)
      await page.mouse.move(
        rootBox.x + rootBox.width * 0.7,
        rootBox.y + rootBox.height * 0.6,
      )
      await page.waitForTimeout(300)
      assert.equal(
        await sourceTransform(),
        beforeSourceInteraction,
        `${presetId} remains stationary without Layer C drag`,
      )
    } else if (presetId === 'liquid-web:reading-glass') {
      await waitUntil(
        async () =>
          (await root.getAttribute('data-source-pointer-listener-attached')) ===
          'true',
        `${presetId} source pointer listener`,
      )
      const rootBox = await root.boundingBox()
      assert.ok(rootBox)
      await page.mouse.move(
        rootBox.x + rootBox.width * 0.68,
        rootBox.y + rootBox.height * 0.62,
      )
      await waitUntil(
        async () => (await sourceTransform()) !== beforeSourceInteraction,
        `${presetId} source pointer follow`,
      )
    } else if (presetId === 'liquid-web:engine-panel') {
      await waitUntil(
        async () =>
          (await root.getAttribute('data-source-pointer-listener-attached')) ===
          'true',
        `${presetId} source pointer listener`,
      )
      const anchor = page.locator(`[data-e11-reference-anchor="${presetId}"]`)
      await anchor.scrollIntoViewIfNeeded()
      await waitUntil(async () => {
        const anchorBox = await anchor.boundingBox()
        const currentLensBox = await shadow.boundingBox()
        return Boolean(
          anchorBox &&
          currentLensBox &&
          Math.abs(anchorBox.x - currentLensBox.x) <= 1 &&
          Math.abs(anchorBox.y - currentLensBox.y) <= 1,
        )
      }, `${presetId} source lens aligned after scrolling`)
      const lensBox = await shadow.boundingBox()
      assert.ok(lensBox)
      const anchorBeforeSourceDrag = await anchor.boundingBox()
      assert.ok(anchorBeforeSourceDrag)
      await page.mouse.move(
        lensBox.x + lensBox.width / 2,
        lensBox.y + lensBox.height / 2,
      )
      await page.mouse.down()
      await page.mouse.move(
        lensBox.x + lensBox.width * 0.7,
        lensBox.y + lensBox.height * 0.62,
        { steps: 4 },
      )
      await page.mouse.up()
      try {
        await waitUntil(
          async () => (await sourceTransform()) !== beforeSourceInteraction,
          `${presetId} raw-engine pointer drag`,
        )
      } catch (error) {
        const state = await page.evaluate((id) => {
          const rootElement = document.querySelector(
            `[data-e11-reference-object-root="${id}"]`,
          )
          const anchorElement = document.querySelector(
            `[data-e11-reference-anchor="${id}"]`,
          )
          const shadowElement = rootElement
            ? [...rootElement.querySelectorAll(':scope > div[aria-hidden="true"]')].at(-1)
            : null
          const point = shadowElement?.getBoundingClientRect()
          return {
            root: rootElement?.getBoundingClientRect().toJSON(),
            anchor: anchorElement?.getBoundingClientRect().toJSON(),
            shadow: point?.toJSON(),
            shadowTransform: shadowElement
              ? getComputedStyle(shadowElement).transform
              : null,
            pointerListener: rootElement?.getAttribute(
              'data-source-pointer-listener-attached',
            ),
            hitElement: point
              ? document
                  .elementFromPoint(
                    point.left + point.width / 2,
                    point.top + point.height / 2,
                  )
                  ?.outerHTML.slice(0, 240)
              : null,
            viewport: [window.innerWidth, window.innerHeight],
          }
        }, presetId)
        throw new Error(`${error.message}; state=${JSON.stringify(state)}`)
      }
      const anchorAfterSourceDrag = await anchor.boundingBox()
      assert.ok(anchorAfterSourceDrag)
      assert.ok(
        Math.abs(anchorAfterSourceDrag.x - anchorBeforeSourceDrag.x) <= 0.5 &&
          Math.abs(anchorAfterSourceDrag.y - anchorBeforeSourceDrag.y) <= 0.5,
        `${presetId} source drag does not replace Layer C drag`,
      )
    }
  } else if (
    preset.renderer === 'glass-project-app-object' ||
    preset.renderer === 'extracted-source-glass-object'
  ) {
    const root = page.locator(
      `[data-e11-reference-object-root="${presetId}"]`,
    )
    const shell = page.locator(
      `[data-selected-reference-preset="${presetId}"]`,
    )
    assert.equal(await root.count(), 1)
    assert.equal(await shell.count(), 1)
    assert.equal((await root.textContent())?.trim(), '')
    assert.equal(await shell.getAttribute('data-source-path'), preset.sourcePath[0])
    assert.equal(await shell.getAttribute('data-source-key'), preset.sourcePresetKey)
    assert.equal(
      await shell.getAttribute('data-source-component-contract'),
      preset.sourceComponent,
    )
    const rendererFamily = await root.getAttribute('data-renderer-family')
    if (
      rendererFamily === 'liquid-dom-webgpu' ||
      rendererFamily === 'r3f-three-glsl'
    ) {
      await waitUntil(
        async () => (await root.getAttribute('data-render-state')) === 'ready',
        `${presetId} target-stage optical input`,
        45_000,
      )
    }
    if (preset.interactions.pointerInteraction) {
      await page.mouse.move(0, 0)
      await page.waitForTimeout(450)
    }
    const rootBox = await root.boundingBox()
    assert.ok(rootBox)
    assert.ok(
      Math.abs(rootBox.width - preset.nativeLayout.width) <= 0.05,
      `${presetId} exact rendered width`,
    )
    assert.ok(
      Math.abs(rootBox.height - preset.nativeLayout.height) <= 0.05,
      `${presetId} exact rendered height`,
    )
    const canvases = root.locator('canvas')
    for (let index = 0; index < await canvases.count(); index += 1) {
      const canvas = canvases.nth(index)
      assert.equal(
        await canvas.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        'rgba(0, 0, 0, 0)',
      )
      if (rendererFamily !== 'liquid-dom-webgpu') {
        assert.equal(
          await canvas.evaluate((element) => {
            const context =
              element.getContext('webgl2') ?? element.getContext('webgl')
            return context?.getContextAttributes()?.alpha ?? false
          }),
          true,
          `${presetId} WebGL alpha channel`,
        )
      }
    }
  } else if (preset.renderer === 'wge-next-submit-button') {
    const button = page.locator(
      `[data-e11-reference-object-root="${presetId}"][data-e11-wge-component="submit-form-button"]`,
    )
    assert.equal(await button.count(), 1)
    assert.equal(await page.locator('form').count(), 0)
    assert.equal(await page.locator('input[type="text"]').count(), 0)
    assert.equal(await page.locator('textarea').count(), 0)
    assert.equal(await page.locator('select').count(), 0)
    assert.equal(await page.locator('.e11-wge-submit-button').count(), 1)
    assert.equal(await button.locator('.e11-wge-submit-button__glass').count(), 1)
    assert.equal(await button.locator('svg filter[id]').count(), 1)
    assert.equal((await button.textContent())?.trim(), '')
    assert.equal(await button.locator('img, [role="img"]').count(), 0)
    const restBackground = await button.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )
    await button.hover()
    await waitUntil(
      async () =>
        (await button.evaluate((element) => getComputedStyle(element).backgroundColor)) !==
        restBackground,
      'WGE submit button hover',
    )
    const urlBeforeSubmit = page.url()
    await button.click()
    assert.equal(page.url(), urlBeforeSubmit)
  } else if (preset.renderer === 'wge-next-bottom-bar') {
    const root = page.locator('[data-e11-wge-component="empty-bottom-bar"]')
    const surface = page.locator('.e11-wge-bottom-bar')
    const filter = page.locator(
      `[data-e11-reference-overlay][data-e11-reference-preset="${presetId}"] svg filter[id]`,
    )
    const blur = filter.locator('feGaussianBlur')
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('input, textarea, select, button, img').count(), 0)
    assert.equal((await root.textContent())?.trim(), '')
    assert.equal(await root.getAttribute('data-visible-child-count'), '0')
    assert.equal(await filter.count(), 1)
    assert.equal(await blur.getAttribute('stdDeviation'), '0')
    await surface.hover()
    await waitUntil(
      async () => Number(await blur.getAttribute('stdDeviation')) === 0.8,
      'WGE bottom bar hover transition',
    )
    await page.mouse.move(0, 0)
    await waitUntil(
      async () => Number(await blur.getAttribute('stdDeviation')) === 0,
      'WGE bottom bar resting transition after hover',
    )
  } else if (preset.renderer === 'liquidgl-webgl') {
    const menu = page.locator('.e11-liquidgl-menu-wrap.menu-wrap')
    assert.equal(await menu.count(), 1)
    assert.equal(await menu.getAttribute('data-reveal'), 'fade')
    assert.equal(await menu.getAttribute('data-bevel-depth'), '0.052')
    assert.equal((await menu.textContent())?.trim(), '')
    assert.equal(await menu.locator('img, a, button, input').count(), 0)
    assert.equal(await menu.getAttribute('data-visible-child-count'), '0')
    const canvas = page.locator('body > canvas[data-liquid-ignore]')
    await canvas.waitFor({
      state: 'attached',
      timeout: 15_000,
    })
    assert.equal(await canvas.count(), 1)
    assert.equal(await canvas.getAttribute('data-source-preset-key'), preset.sourcePresetKey)
    assert.equal(await canvas.getAttribute('data-transparent-render-surface'), 'true')
    assert.equal(
      await canvas.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgba(0, 0, 0, 0)',
    )
    assert.equal(
      await canvas.evaluate((element) => {
        const context = element.getContext('webgl2') ?? element.getContext('webgl')
        return context?.getContextAttributes()?.alpha ?? false
      }),
      true,
    )
    assert.equal(await page.locator('script[data-e11-liquidgl-script]').count(), 1)
  }

  assert.equal(await page.locator(mountedFamilySelector).count(), 1)
  await assertUniqueE11Ids(page)
}

async function selectSave(page, save) {
  const button = page.getByRole('button', {
    name: saveAriaLabel(save),
    exact: true,
    includeHidden: true,
  })
  assert.equal(await button.count(), 1, `exact aria label for Save ${save.id}`)
  await button.scrollIntoViewIfNeeded()
  await button.click()
  await page
    .locator(`.experiment-set-one-page[data-selected-save-eleven="${save.id}"]`)
    .waitFor({ state: 'attached' })
}

async function selectAndAssert(page, save, layerBBaseline, { drag = false } = {}) {
  const presetId = save.e11LayerCReferencePreset
  const preset = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
  await selectSave(page, save)
  await assertNativeAnchor(page, presetId, preset.nativeLayout)
  await assertFamilyStructure(page, presetId, preset)
  await assertObjectOnlyCompositing(page, presetId, preset, layerBBaseline)

  assert.equal(await page.locator('[data-e11-reference-anchor]').count(), 1)
  assert.equal(
    await page.locator(`[data-e11-reference-preset]:not([data-e11-reference-preset="${presetId}"])`)
      .filter({ hasNot: page.locator('[data-e11-reference-preview]') })
      .count(),
    0,
    `${presetId} has no stale preset renderer`,
  )

  if (!drag) return
  const anchor = page.locator(`[data-e11-reference-anchor="${presetId}"]`)
  const before = await anchor.boundingBox()
  assert.ok(before)
  const bounds = await anchor.evaluate((element) => {
    const parent = element.closest('.experiment-set-two-drag-bounds')
    return parent?.getBoundingClientRect().toJSON() ?? null
  })
  assert.ok(bounds)
  const downSpace = bounds.y + bounds.height - (before.y + before.height)
  const upSpace = before.y - bounds.y
  const deltaY = downSpace >= 14 || downSpace >= upSpace ? 18 : -18
  await page.mouse.move(before.x + before.width / 2, before.y + 4)
  await page.mouse.down()
  await page.mouse.move(before.x + before.width / 2, before.y + 4 + deltaY, { steps: 5 })
  await page.mouse.up()
  await waitUntil(async () => {
    const after = await anchor.boundingBox()
    return Boolean(after && Math.abs(after.y - before.y) >= 6)
  }, `${presetId} Layer C drag`)
  const after = await anchor.boundingBox()
  assert.ok(after)

  const visual = preset.renderer === 'fluid-glass-r3f'
    ? page.locator(`.e11-ref-fluid-glass-stage[data-e11-reference-preset="${presetId}"]`)
    : preset.renderer === 'liquidgl-webgl'
      ? page.locator('.e11-liquidgl-menu-anchor')
      : page.locator(
        `[data-e11-reference-overlay][data-e11-reference-preset="${presetId}"] .experiment-eleven-reference-host`,
      )
  await waitUntil(async () => {
    const visualBox = await visual.boundingBox()
    const anchorBox = await anchor.boundingBox()
    const renderOffsetY = preset.renderer === 'fluid-glass-r3f' ||
      preset.renderer === 'liquidgl-webgl'
      ? 0
      : Number(await visual.getAttribute('data-e11-reference-render-offset-y')) || 0
    const expectedVisualTop = anchorBox
      ? anchorBox.y - renderOffsetY * (anchorBox.height / preset.nativeLayout.height)
      : 0
    return Boolean(
      visualBox &&
      anchorBox &&
      Math.abs(visualBox.y - expectedVisualTop) <= 1,
    )
  }, `${presetId} renderer following its dragged anchor`)

  const moved = await anchor.boundingBox()
  assert.ok(moved)
  await page.mouse.move(moved.x + moved.width / 2, moved.y + 4)
  await page.mouse.down()
  await page.mouse.move(
    moved.x + moved.width / 2,
    moved.y + 4 - deltaY,
    { steps: 5 },
  )
  await page.mouse.up()
  await waitUntil(async () => {
    const restored = await anchor.boundingBox()
    return Boolean(restored && Math.abs(restored.y - before.y) <= 2)
  }, `${presetId} Layer C drag restoration`)
}

async function cleanupToSave249(page) {
  await selectSave(page, save249)
  await waitUntil(
    async () =>
      (await page.locator('[data-e11-reference-anchor]').count()) === 0 &&
      (await page.locator('[data-e11-reference-overlay]').count()) === 0 &&
      (await page.locator(mountedFamilySelector).count()) === 0 &&
      (await page.locator('body > canvas[data-liquid-ignore]').count()) === 0 &&
      (await page.locator('script[data-e11-liquidgl-script]').count()) === 0 &&
      (await page.locator('.e11-ref-fluid-glass-stage canvas').count()) === 0,
    'all reference renderers to unmount after selecting Save 249',
    15_000,
  )
  assert.equal(await page.locator('[id^="e11-liquid-main-"], [id^="e11-web-glass-"], [id^="e11-wge-"]').count(), 0)
  assert.equal(await page.locator('#liquid-gl-dynamic-styles').count(), 0)
  assert.equal(
    await page.evaluate(
      () => Boolean(window.liquidGL || window.__liquidGLRenderer__ || window.html2canvas),
    ),
    false,
  )
}

test('all 54 Experiment Eleven reference saves mount, follow drag, switch, and clean up', {
  timeout: 360_000,
}, async () => {
  assert.equal(referenceSaves.length, 54)
  assert.ok(save249)
  await assertPortFree()
  buildProductionTarget()
  const vite = startVite('preview')
  let browser
  try {
    await waitForServer(vite.child, vite.output)
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    const runtimeErrors = []
    const failedSourceRequests = []

    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error' || /react (warning|error)/i.test(message.text())) {
        runtimeErrors.push(`console.${message.type()}: ${message.text()}`)
      }
    })
    page.on('response', (response) => {
      if (
        response.url().includes('/vendor/reference-glass/') &&
        response.status() >= 400
      ) {
        failedSourceRequests.push(`${response.status()} ${response.url()}`)
      }
    })
    page.on('requestfailed', (request) => {
      if (request.url().includes('/vendor/reference-glass/')) {
        failedSourceRequests.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
      }
    })

    await page.goto(`${baseUrl}/experiment-set-1`, { waitUntil: 'domcontentloaded' })
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })

    const experimentTab = page.getByRole('button', {
      name: 'right overlap pane',
      exact: true,
      includeHidden: true,
    })
    await experimentTab.waitFor({ state: 'visible', timeout: 15_000 })
    assert.equal(await experimentTab.count(), 1)
    await experimentTab.click()
    await page.getByRole('group', {
      name: 'Experiment saves',
      exact: true,
      includeHidden: true,
    }).waitFor()

    const assetPaths = collectRelativeFiles(sourceAssetDirectory)
    assert.ok(assetPaths.length > 0)
    for (const relativePath of assetPaths) {
      const response = await context.request.get(
        `${baseUrl}/vendor/reference-glass/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
      )
      assert.equal(response.status(), 200, relativePath)
    }

    await selectSave(page, save249)
    const layerBBaseline = await readLayerBState(page)
    assert.equal(layerBBaseline.opacity, '1')
    assert.equal(layerBBaseline.clipPath, 'none')
    assert.equal(layerBBaseline.inlineClipPath, '')

    for (const save of referenceSaves) {
      await selectAndAssert(page, save, layerBBaseline, { drag: true })
    }

    const rendererRepresentatives = []
    const seenRenderers = new Set()
    for (const save of referenceSaves) {
      const renderer = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[
        save.e11LayerCReferencePreset
      ].renderer
      if (seenRenderers.has(renderer)) continue
      seenRenderers.add(renderer)
      rendererRepresentatives.push(save)
    }
    assert.equal(rendererRepresentatives.length, 10)

    await cleanupToSave249(page)
    for (const save of rendererRepresentatives) {
      await selectAndAssert(page, save, layerBBaseline)
      const firstMount = await page.evaluate((selector) => ({
        families: document.querySelectorAll(selector).length,
        overlays: document.querySelectorAll('[data-e11-reference-overlay]').length,
        canvases: document.querySelectorAll('body canvas').length,
        filters: document.querySelectorAll('svg filter[id]').length,
        e11Ids: new Set(
          [...document.querySelectorAll('[id]')]
            .map((element) => element.id)
            .filter((id) => id.startsWith('e11-')),
        ).size,
      }), mountedFamilySelector)
      await cleanupToSave249(page)
      await selectAndAssert(page, save, layerBBaseline)
      const secondMount = await page.evaluate((selector) => ({
        families: document.querySelectorAll(selector).length,
        overlays: document.querySelectorAll('[data-e11-reference-overlay]').length,
        canvases: document.querySelectorAll('body canvas').length,
        filters: document.querySelectorAll('svg filter[id]').length,
        e11Ids: new Set(
          [...document.querySelectorAll('[id]')]
            .map((element) => element.id)
            .filter((id) => id.startsWith('e11-')),
        ).size,
      }), mountedFamilySelector)
      assert.deepEqual(secondMount, firstMount, `${save.e11LayerCReferencePreset} repeat mount`)
      await cleanupToSave249(page)
    }

    assert.deepEqual(failedSourceRequests, [])
    assert.deepEqual(runtimeErrors, [])
    await context.close()
  } finally {
    await browser?.close()
    await stopProcess(vite.child)
  }
})

test('FluidGlass repeat mounts are clean under the development StrictMode runtime', {
  timeout: 180_000,
}, async () => {
  await assertPortFree()
  const vite = startVite('development')
  let browser
  try {
    await waitForServer(vite.child, vite.output)
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    const runtimeErrors = []
    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error' || /react (warning|error)/i.test(message.text())) {
        runtimeErrors.push(`console.${message.type()}: ${message.text()}`)
      }
    })

    await page.goto(`${baseUrl}/experiment-set-1`, { waitUntil: 'domcontentloaded' })
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })
    const experimentTab = page.getByRole('button', {
      name: 'right overlap pane',
      exact: true,
      includeHidden: true,
    })
    await experimentTab.waitFor({ state: 'visible', timeout: 15_000 })
    await experimentTab.click()

    const fluidSaves = referenceSaves.filter((save) =>
      save.e11LayerCReferencePreset.startsWith('fluid-glass:'))
    assert.equal(fluidSaves.length, 5)
    for (const save of [...fluidSaves, fluidSaves[0]]) {
      await selectSave(page, save)
      await page.locator('.e11-ref-fluid-glass-stage canvas').waitFor({
        state: 'attached',
        timeout: 20_000,
      })
      assert.equal(await page.locator('.e11-ref-fluid-glass-stage canvas').count(), 1)
      await assertUniqueE11Ids(page)
      await cleanupToSave249(page)
    }

    assert.deepEqual(runtimeErrors, [])
    await context.close()
  } finally {
    await browser?.close()
    await stopProcess(vite.child)
  }
})
