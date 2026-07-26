import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { test } from 'node:test'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))
const host = '127.0.0.1'
const port = 41839
const baseUrl = `http://${host}:${port}`

async function assertPortFree() {
  await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
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

async function waitUntil(predicate, description, timeoutMs = 15_000) {
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

async function waitForServer(vite) {
  await waitUntil(async () => {
    if (vite.child.exitCode != null) {
      throw new Error(`Vite exited with ${vite.child.exitCode}\n${vite.output.join('')}`)
    }
    try {
      const response = await fetch(`${baseUrl}/button-source-experiments`)
      return response.ok
    } catch {
      return false
    }
  }, 'button experiment Vite server', 20_000)
}

async function selectSave(page, saveId, presetId) {
  await page.locator('#button-source-save').selectOption(String(saveId))
  await waitUntil(
    async () =>
      (await page.locator(`[data-selected-preset="${presetId}"]`).count()) === 6,
    `Save ${saveId} to mount six ${presetId} copies`,
  )
}

async function assertUniqueFilterIds(page, expectedCount) {
  const ids = await page.locator('filter[id]').evaluateAll(
    (filters) => filters.map((filter) => filter.id),
  )
  assert.equal(ids.length, expectedCount)
  assert.equal(new Set(ids).size, expectedCount)
}

test('Groups M–P mount exact source structures, states, and cleanup', {
  timeout: 120_000,
}, async () => {
  await assertPortFree()
  const vite = startVite()
  let browser
  try {
    await waitForServer(vite)
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    })
    await context.addInitScript(() => {
      const listeners = new Set()
      const add = window.addEventListener.bind(window)
      const remove = window.removeEventListener.bind(window)
      window.__buttonTestScrollListeners = listeners
      window.addEventListener = (type, listener, options) => {
        if (type === 'scroll') listeners.add(listener)
        return add(type, listener, options)
      }
      window.removeEventListener = (type, listener, options) => {
        if (type === 'scroll') listeners.delete(listener)
        return remove(type, listener, options)
      }
    })
    const page = await context.newPage()
    const runtimeErrors = []
    const failedAssets = []
    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error' || /react (warning|error)/i.test(message.text())) {
        runtimeErrors.push(`console.${message.type()}: ${message.text()}`)
      }
    })
    page.on('response', (response) => {
      if (
        response.url().includes('/vendor/reference-glass/liquid-glass-dist/') &&
        response.status() >= 400
      ) {
        failedAssets.push(`${response.status()} ${response.url()}`)
      }
    })
    page.on('requestfailed', (request) => {
      if (request.url().includes('/vendor/reference-glass/liquid-glass-dist/')) {
        failedAssets.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
      }
    })

    await page.goto(`${baseUrl}/button-source-experiments`, {
      waitUntil: 'domcontentloaded',
    })
    await page.locator('.button-experiment-set').waitFor({ state: 'visible' })
    const listenerBaseline = await page.evaluate(
      () => window.__buttonTestScrollListeners.size,
    )

    // Exercise unmount while html2canvas is still resolving.
    await selectSave(page, 1150, 'liquid-glass-js:circle-play')
    await page.locator('.glass-button').first().waitFor({ state: 'attached' })
    await selectSave(page, 1149, 'pure-css-ios26:glass-button')
    assert.equal(await page.locator('.glass-button, .button-src-liquid-js-host').count(), 0)

    await selectSave(page, 1146, 'wge-next:nav-top')
    const wgeButtons = page.locator('.button-src-wge')
    assert.equal(await wgeButtons.count(), 6)
    await assertUniqueFilterIds(page, 6)
    const wgeRest = await wgeButtons.first().evaluate((element) => {
      const style = getComputedStyle(element)
      const icon = element.querySelector(':scope > svg')
      return {
        width: style.width,
        height: style.height,
        radius: style.borderRadius,
        background: style.backgroundColor,
        color: style.color,
        cursor: style.cursor,
        iconWidth: icon ? getComputedStyle(icon).width : '',
        iconHeight: icon ? getComputedStyle(icon).height : '',
      }
    })
    assert.deepEqual(wgeRest, {
      width: '52px',
      height: '52px',
      radius: '26px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'rgba(0, 0, 0, 0.8)',
      cursor: 'pointer',
      iconWidth: '20px',
      iconHeight: '20px',
    })
    const wgeObject = page.locator(
      '[data-reference-preset="wge-next:nav-top"]',
    ).first()
    const wgeBlur = wgeObject.locator('filter feGaussianBlur')
    await wgeButtons.first().hover()
    assert.equal(
      await wgeButtons.first().evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
      'rgba(255, 255, 255, 0.35)',
    )
    await waitUntil(
      async () => Math.abs(Number(await wgeBlur.getAttribute('stdDeviation')) - 1.5) < 0.01,
      'Group M blur spring to reach 1.5',
    )
    await page.mouse.move(0, 0)
    await waitUntil(
      async () => Math.abs(Number(await wgeBlur.getAttribute('stdDeviation'))) < 0.01,
      'Group M blur spring to return to zero',
    )

    await selectSave(page, 1147, 'web-glass:nav-default')
    const defaultSurfaces = page.locator('.button-src-web-glass')
    assert.equal(await defaultSurfaces.count(), 6)
    assert.equal(await page.locator('.button-src-web-glass.is-hovered').count(), 0)
    await assertUniqueFilterIds(page, 6)
    const defaultSurfaceState = await defaultSurfaces.evaluateAll((surfaces) =>
      surfaces.map((surface) => ({
        background: getComputedStyle(surface).backgroundColor,
        config: surface.getAttribute('data-source-config'),
        refractiveIndex: surface.getAttribute('data-source-refractive-index'),
        blur: surface.getAttribute('data-source-blur'),
      })),
    )
    assert.deepEqual(
      [...new Set(defaultSurfaceState.map((state) => JSON.stringify(state)))],
      [JSON.stringify({
        background: 'rgba(0, 0, 0, 0)',
        config: 'PRESETS.navButton',
        refractiveIndex: '1.4',
        blur: '0',
      })],
    )
    const defaultFilter = page.locator('filter').first()
    assert.equal(
      await defaultFilter.locator('feGaussianBlur').getAttribute('stdDeviation'),
      '0',
    )
    assert.equal(
      await defaultFilter.locator('feColorMatrix').getAttribute('values'),
      '4',
    )
    assert.equal(
      await defaultFilter.locator('feComponentTransfer feFuncA').getAttribute('slope'),
      '0.9',
    )
    assert.equal(await defaultFilter.locator('feImage').first().getAttribute('width'), '52px')
    assert.equal(await defaultFilter.locator('feImage').first().getAttribute('height'), '52px')

    await selectSave(page, 1148, 'web-glass:nav-hovered')
    const hoveredSurfaces = page.locator('.button-src-web-glass')
    assert.equal(await hoveredSurfaces.count(), 6)
    assert.equal(await page.locator('.button-src-web-glass.is-hovered').count(), 0)
    assert.deepEqual(
      await hoveredSurfaces.evaluateAll((surfaces) =>
        [...new Set(surfaces.map((surface) => JSON.stringify({
          background: getComputedStyle(surface).backgroundColor,
          config: surface.getAttribute('data-source-config'),
          refractiveIndex: surface.getAttribute('data-source-refractive-index'),
          blur: surface.getAttribute('data-source-blur'),
        })))],
      ),
      [JSON.stringify({
        background: 'rgba(0, 0, 0, 0)',
        config: 'PRESETS.navButtonHover',
        refractiveIndex: '3',
        blur: '1.5',
      })],
    )
    assert.equal(
      await page.locator('filter feGaussianBlur').first().getAttribute('stdDeviation'),
      '1.5',
    )

    await selectSave(page, 1149, 'pure-css-ios26:glass-button')
    const iosButtons = page.locator('.button-src-ios26')
    assert.equal(await iosButtons.count(), 6)
    await assertUniqueFilterIds(page, 6)
    const iosFilter = page.locator('filter').first()
    assert.equal(await iosFilter.getAttribute('primitiveUnits'), 'objectBoundingBox')
    const mapHref = await iosFilter.locator('feImage').getAttribute('href')
    assert.match(mapHref, /\/vendor\/reference-glass\/liquid-glass-dist\/frosted-map\.png$/)
    assert.equal(
      await iosFilter.locator('feGaussianBlur').getAttribute('stdDeviation'),
      '0.02',
    )
    const displacement = iosFilter.locator('feDisplacementMap')
    assert.deepEqual(
      {
        input: await displacement.getAttribute('in'),
        input2: await displacement.getAttribute('in2'),
        scale: await displacement.getAttribute('scale'),
        x: await displacement.getAttribute('xChannelSelector'),
        y: await displacement.getAttribute('yChannelSelector'),
      },
      { input: 'blur', input2: 'map', scale: '1', x: 'R', y: 'G' },
    )
    assert.deepEqual(
      await iosButtons.first().locator('.button-src-ios26__icon path').evaluateAll(
        (paths) => paths.map((path) => path.getAttribute('d')),
      ),
      ['M5 12h14', 'M12 5v14'],
    )
    assert.deepEqual(
      await iosButtons.first().evaluate((element) => ({
        width: getComputedStyle(element).width,
        height: getComputedStyle(element).height,
        iconWidth: getComputedStyle(
          element.querySelector('.button-src-ios26__icon'),
        ).width,
        beforeBackground: getComputedStyle(element, '::before').backgroundColor,
        afterFilter: getComputedStyle(element, '::after').filter,
      })),
      {
        width: '70px',
        height: '70px',
        iconWidth: '40px',
        beforeBackground: 'rgba(255, 255, 255, 0.1)',
        afterFilter: `url("#${await iosFilter.getAttribute('id')}")`,
      },
    )

    await selectSave(page, 1150, 'liquid-glass-js:circle-play')
    const exactButtons = page.locator(
      '.button-src-liquid-js-host > .glass-container.glass-container-circle.glass-button.glass-button-circle',
    )
    assert.equal(await exactButtons.count(), 6)
    await waitUntil(
      async () =>
        (await page.evaluate(() => window.__buttonTestScrollListeners.size)) ===
        listenerBaseline + 6,
      'six liquid-glass-js render listeners',
      20_000,
    )
    assert.deepEqual(
      await exactButtons.evaluateAll((buttons) =>
        buttons.map((button) => {
          const canvas = button.querySelector('canvas')
          const text = button.querySelector('.glass-button-text')
          return {
            classes: button.className,
            width: getComputedStyle(button).width,
            height: getComputedStyle(button).height,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            text: text?.textContent,
            textShadow: text ? getComputedStyle(text).textShadow : '',
          }
        }),
      ),
      Array.from({ length: 6 }, () => ({
        classes: 'glass-container glass-container-circle glass-button glass-button-circle',
        width: '80px',
        height: '80px',
        canvasWidth: 80,
        canvasHeight: 80,
        text: '▶',
        textShadow: 'none',
      })),
    )

    await selectSave(page, 1149, 'pure-css-ios26:glass-button')
    await waitUntil(
      async () =>
        (await page.locator('.glass-button, .button-src-liquid-js-host').count()) === 0 &&
        (await page.evaluate(() => window.__buttonTestScrollListeners.size)) ===
          listenerBaseline,
      'liquid-glass-js DOM and listeners to clean up',
    )
    assert.deepEqual(failedAssets, [])
    assert.deepEqual(runtimeErrors, [])
  } finally {
    await browser?.close()
    await stopProcess(vite.child)
  }
})
