import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { test } from 'node:test'
import {
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
} from '../src/components/experiment-set-one/experimentElevenReferencePresets.ts'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const saves = JSON.parse(
  readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'),
)
const referenceSaves = saves
  .filter((save) => save.id >= 1038 && save.id <= 1067)
  .sort((left, right) => left.id - right.id)
const save249 = saves.find((save) => save.id === 249)
const host = '127.0.0.1'
const port = 41787
const baseUrl = `http://${host}:${port}`
const sourceAssetDirectory = fileURLToPath(
  new URL('../public/vendor/reference-glass', import.meta.url),
)
const mountedFamilySelector = [
  '.e11-ref-fluid-glass-stage',
  '.e11-liquidgl-overlay',
  '.e11-liquid-web-reference',
  '.e11-wge-form',
  '.e11-wge-bottom-bar__state',
  '.e11-web-glass-surface',
  '.e11-liquid-main-surface',
  '.e11-ref-glass-surface',
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
    assert.equal(await root.count(), 1)
    assert.equal(await root.getAttribute('data-liquid-glass-width'), String(preset.nativeLayout.width))
    assert.equal(await root.getAttribute('data-liquid-glass-height'), String(preset.nativeLayout.height))
    await waitUntil(
      async () => (await root.locator('filter[id]').count()) >= 1,
      `${presetId} generated SVG filter`,
    )
  } else if (preset.renderer === 'wge-next-form') {
    assert.equal(await page.locator('[data-e11-wge-component="complete-form"]').count(), 1)
    const form = page.getByRole('form', { name: 'WGE Next complete form', exact: true })
    assert.equal(await form.count(), 1)
    assert.equal(await form.locator('input[type="text"]').count(), 2)
    assert.equal(await form.locator('textarea').count(), 1)
    assert.equal(await form.locator('select').count(), 1)
    assert.equal(await form.locator('button[type="submit"]').count(), 1)
    assert.equal(await page.locator('.e11-wge-form svg filter[id]').count(), 5)
    await form.getByRole('textbox', { name: 'First Name', exact: true }).fill('Ada')
    await form.getByRole('textbox', { name: 'Last Name', exact: true }).fill('Lovelace')
    await form.getByRole('textbox', { name: 'Message', exact: true }).fill('Layer C verification')
    await form.getByRole('combobox', { name: 'Gender', exact: true })
      .selectOption('prefer-not-to-say')
    const urlBeforeSubmit = page.url()
    await form.getByRole('button', { name: 'Submit', exact: true }).click()
    assert.equal(page.url(), urlBeforeSubmit)
  } else if (preset.renderer === 'wge-next-bottom-bar') {
    const root = page.locator('[data-e11-wge-component="complete-bottom-bar"]')
    const surface = page.locator('.e11-wge-bottom-bar')
    const blur = surface.locator('feGaussianBlur')
    const search = root.locator('input[placeholder="Search images..."]')
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('input[type="number"]').count(), 2)
    assert.equal(await search.count(), 1)
    assert.equal(await root.locator('button').count(), 2)
    assert.equal(await surface.locator('svg filter[id]').count(), 1)
    assert.equal(await blur.getAttribute('stdDeviation'), '0')
    await surface.hover()
    await waitUntil(
      async () => Number(await blur.getAttribute('stdDeviation')) === 0.8,
      'WGE bottom bar hover transition',
    )
    await search.focus()
    await waitUntil(
      async () => Number(await blur.getAttribute('stdDeviation')) === 3.5,
      'WGE bottom bar search-focus transition',
    )
    await search.fill('aurora')
    assert.equal(await search.inputValue(), 'aurora')
    await search.press('Tab')
    await waitUntil(
      async () => Number(await blur.getAttribute('stdDeviation')) === 0,
      'WGE bottom bar resting transition after search blur',
    )
  } else if (preset.renderer === 'liquidgl-webgl') {
    const menu = page.locator('.e11-liquidgl-menu-wrap.menu-wrap')
    assert.equal(await menu.count(), 1)
    assert.equal(await menu.getAttribute('data-reveal'), 'fade')
    assert.equal(await menu.getAttribute('data-bevel-depth'), '0.052')
    await page.locator('body > canvas[data-liquid-ignore]').waitFor({
      state: 'attached',
      timeout: 15_000,
    })
    assert.equal(await page.locator('body > canvas[data-liquid-ignore]').count(), 1)
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

async function selectAndAssert(page, save, { drag = false } = {}) {
  const presetId = save.e11LayerCReferencePreset
  const preset = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
  await selectSave(page, save)
  await assertNativeAnchor(page, presetId, preset.nativeLayout)
  await assertFamilyStructure(page, presetId, preset)

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
}

async function cleanupToSave249(page) {
  await selectSave(page, save249)
  await waitUntil(
    async () =>
      (await page.locator('[data-e11-reference-anchor]').count()) === 0 &&
      (await page.locator('[data-e11-reference-overlay]').count()) === 0 &&
      (await page.locator(mountedFamilySelector).count()) === 0 &&
      (await page.locator('body > canvas[data-liquid-ignore]').count()) === 0 &&
      (await page.locator('.e11-ref-fluid-glass-stage canvas').count()) === 0,
    'all reference renderers to unmount after selecting Save 249',
    15_000,
  )
  assert.equal(await page.locator('[id^="e11-liquid-main-"], [id^="e11-web-glass-"], [id^="e11-wge-"]').count(), 0)
  assert.equal(await page.locator('#liquid-gl-dynamic-styles').count(), 0)
}

test('all 30 Experiment Eleven reference saves mount, follow drag, switch, and clean up', {
  timeout: 360_000,
}, async () => {
  assert.equal(referenceSaves.length, 30)
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

    for (const save of referenceSaves) {
      await selectAndAssert(page, save, { drag: true })
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
    assert.equal(rendererRepresentatives.length, 8)

    await cleanupToSave249(page)
    for (const save of rendererRepresentatives) {
      await selectAndAssert(page, save)
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
      await selectAndAssert(page, save)
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
