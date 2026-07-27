import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { test } from 'node:test'
import { EXPERIMENT_ELEVEN_LAYER_C_LAYOUT } from '../src/components/experiment-set-one/experimentElevenLayerCLayout.ts'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const saves = JSON.parse(
  readFileSync(new URL('../src/data/experiment-set-one/saves.json', import.meta.url), 'utf8'),
)
const standardizedSaves = saves
  .filter((save) => save.id >= 1080 && save.id <= 1091)
  .sort((left, right) => left.id - right.id)

const host = '127.0.0.1'
const port = 41853
const baseUrl = `http://${host}:${port}`

// Subpixel tolerance: placement is rounded to whole pixels, but layout may be
// measured against a fractionally positioned ancestor.
const POSITION_TOLERANCE_PX = 0.5

async function assertPortFree() {
  await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', (error) => {
      reject(new Error(`Test port ${port} is unavailable: ${error.message}`))
    })
    probe.listen(port, host, () => {
      probe.close((error) => (error ? reject(error) : resolve()))
    })
  })
}

function startVite() {
  const output = []
  const child = spawn(
    process.execPath,
    [
      `${repositoryRoot}/node_modules/vite/bin/vite.js`,
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

function launchBrowser() {
  return chromium.launch({
    headless: true,
    // The Liquid DOM objects render through WebGPU, which the headless shell
    // does not expose without these switches.
    args: ['--enable-unsafe-webgpu', '--use-angle=metal'],
  })
}

test('the button experiment is reachable from Experiment Set 1 through visible UI', {
  timeout: 120_000,
}, async () => {
  await assertPortFree()
  const vite = startVite()
  let browser
  try {
    await waitForServer(vite.child, vite.output)
    browser = await launchBrowser()
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

    await page.goto(`${baseUrl}/experiment-set-1`, { waitUntil: 'domcontentloaded' })
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })

    // Forward: Experiment Set 1 -> Button Source Experiments, clicking only
    // what a user can actually see. No direct URL navigation.
    const toButtons = page.getByRole('link', { name: 'Button Source Experiments', exact: true })
    await toButtons.waitFor({ state: 'visible', timeout: 15_000 })
    assert.equal(await toButtons.count(), 1)
    await toButtons.click()
    await page.waitForURL(`${baseUrl}/button-source-experiments`, { timeout: 15_000 })
    assert.equal(new URL(page.url()).pathname, '/button-source-experiments')
    await page.locator('[data-button-experiment-set]').first().waitFor({ state: 'visible', timeout: 15_000 })

    // Reverse: Button Source Experiments -> Experiment Set 1.
    const toExperiments = page.getByRole('link', { name: 'Experiment Set 1', exact: true })
    await toExperiments.waitFor({ state: 'visible', timeout: 15_000 })
    assert.equal(await toExperiments.count(), 1)
    await toExperiments.click()
    await page.waitForURL(`${baseUrl}/experiment-set-1`, { timeout: 15_000 })
    assert.equal(new URL(page.url()).pathname, '/experiment-set-1')
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })

    // Both labels stay visible on both standalone pages.
    for (const path of ['/experiment-set-1', '/button-source-experiments']) {
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
      for (const label of ['Experiment Set 1', 'Button Source Experiments']) {
        await assert.doesNotReject(
          page.getByRole('link', { name: label, exact: true }).waitFor({ state: 'visible', timeout: 15_000 }),
          `${label} must be visible on ${path}`,
        )
      }
    }
  } finally {
    await browser?.close()
    await stopProcess(vite.child)
  }
})

test('every standardized duplicate opens at the same Layer C geometry and inset-relative position', {
  timeout: 240_000,
}, async () => {
  assert.equal(standardizedSaves.length, 12)
  await assertPortFree()
  const vite = startVite()
  let browser
  try {
    await waitForServer(vite.child, vite.output)
    browser = await launchBrowser()
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

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
    await experimentTab.click()
    await page.getByRole('group', { name: 'Experiment saves', exact: true, includeHidden: true }).waitFor()

    const measurements = []
    for (const save of standardizedSaves) {
      const chip = page.getByRole('button', { name: save.label, exact: true, includeHidden: true })
      assert.equal(await chip.count(), 1, `exact chip for Save ${save.id}`)
      await chip.scrollIntoViewIfNeeded()
      await chip.click()
      await page
        .locator(`.experiment-set-one-page[data-selected-save-eleven="${save.id}"]`)
        .waitFor({ state: 'attached' })
      // Wait for the root belonging to *this* preset. Waiting on the unscoped
      // selector can match the outgoing save's root and then race its unmount.
      const presetId = save.e11LayerCReferencePreset
      await page
        .locator(`[data-e11-reference-anchor="${presetId}"]`)
        .waitFor({ state: 'attached', timeout: 20_000 })
      await page
        .locator(`[data-e11-reference-object-root="${presetId}"]`)
        .waitFor({ state: 'attached', timeout: 20_000 })

      const measured = await page.evaluate((selectedPresetId) => {
        const anchor = document.querySelector(
          `[data-e11-reference-anchor="${selectedPresetId}"]`,
        )
        const inset = document.querySelector(
          '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
        )
        if (!anchor || !inset) return null
        const a = anchor.getBoundingClientRect()
        const i = inset.getBoundingClientRect()
        return {
          width: a.width,
          height: a.height,
          radius: parseFloat(getComputedStyle(anchor).borderTopLeftRadius),
          x: a.left - i.left,
          y: a.top - i.top,
          // The invariant is that no *other* preset's renderer is still
          // mounted. Counting all roots would also fail on a transient remount
          // of the selected object's own WebGL root.
          staleRoots: document.querySelectorAll(
            `[data-e11-reference-object-root]:not([data-e11-reference-object-root="${selectedPresetId}"])`,
          ).length,
        }
      }, presetId)
      assert.ok(measured, `Save ${save.id} anchor and bezel inset`)

      // The rendered object really is the target geometry — not a scaled one.
      assert.ok(
        Math.abs(measured.width - EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width) <= 0.05,
        `Save ${save.id} width ${measured.width}`,
      )
      assert.ok(
        Math.abs(measured.height - EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height) <= 0.05,
        `Save ${save.id} height ${measured.height}`,
      )
      assert.equal(measured.radius, EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.radius, `Save ${save.id} radius`)
      assert.equal(measured.staleRoots, 0, `Save ${save.id} leaves no stale renderer`)

      measurements.push({ id: save.id, ...measured })
    }

    // Placement is pane-relative and identical for all twelve, so selecting a
    // differently sized save beforehand can never leave one offset.
    const [first] = measurements
    for (const measured of measurements) {
      assert.ok(
        Math.abs(measured.x - first.x) <= POSITION_TOLERANCE_PX,
        `Save ${measured.id} x ${measured.x} vs ${first.x}`,
      )
      assert.ok(
        Math.abs(measured.y - first.y) <= POSITION_TOLERANCE_PX,
        `Save ${measured.id} y ${measured.y} vs ${first.y}`,
      )
    }

    // The shared position is exactly what the existing centred draggable-pane
    // logic yields for the Save 248 Layer C geometry inside Layer B.
    const layerB = await page.evaluate(() => {
      const element = document.querySelector(
        '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
      )
      const rect = element.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    })
    const expectedX = Math.round((layerB.width - EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.width) / 2)
    const expectedY = Math.round((layerB.height - EXPERIMENT_ELEVEN_LAYER_C_LAYOUT.height) / 2)
    assert.ok(
      Math.abs(first.x - expectedX) <= POSITION_TOLERANCE_PX,
      `standardized x ${first.x} should be the centred ${expectedX}`,
    )
    assert.ok(
      Math.abs(first.y - expectedY) <= POSITION_TOLERANCE_PX,
      `standardized y ${first.y} should be the centred ${expectedY}`,
    )

    // Reload determinism: the same save reopens at the same place.
    const last = standardizedSaves.at(-1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.locator('.experiment-set-one-page').waitFor({ state: 'visible' })
    await page.locator('[data-e11-reference-anchor]').waitFor({ state: 'attached', timeout: 15_000 })
    const afterReload = await page.evaluate(() => {
      const anchor = document.querySelector('[data-e11-reference-anchor]')
      const inset = document.querySelector(
        '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
      )
      const a = anchor.getBoundingClientRect()
      const i = inset.getBoundingClientRect()
      return { x: a.left - i.left, y: a.top - i.top }
    })
    const before = measurements.find((entry) => entry.id === last.id)
    assert.ok(
      Math.abs(afterReload.x - before.x) <= POSITION_TOLERANCE_PX,
      `Save ${last.id} x is not deterministic across reload`,
    )
    assert.ok(
      Math.abs(afterReload.y - before.y) <= POSITION_TOLERANCE_PX,
      `Save ${last.id} y is not deterministic across reload`,
    )
  } finally {
    await browser?.close()
    await stopProcess(vite.child)
  }
})
