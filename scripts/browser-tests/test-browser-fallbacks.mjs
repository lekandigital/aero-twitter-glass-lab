import fs from 'node:fs';

const URL = 'http://localhost:5173';
const OUT_DIR = '/tmp/aero-browser-tests';
fs.mkdirSync(OUT_DIR, { recursive: true });

async function testCurl() {
  console.log('\n[1] Testing localhost with fetch...');
  const res = await fetch(URL);
  console.log(`Status: ${res.status} ${res.statusText}`);
  if (!res.ok) throw new Error(`Localhost failed: ${res.status}`);
}

async function testPlaywrightBundled() {
  console.log('\n[2] Testing Playwright bundled Chromium...');
  const { chromium } = await import('playwright');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  const title = await page.title();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const screenshot = `${OUT_DIR}/playwright-bundled-chromium.png`;

  await page.screenshot({ path: screenshot, fullPage: true });
  await browser.close();

  console.log({ title, bodyText: bodyText.slice(0, 160), screenshot });
}

async function testPlaywrightChrome() {
  console.log('\n[3] Testing Playwright with installed Google Chrome...');
  const { chromium } = await import('playwright');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  if (!fs.existsSync(chromePath)) {
    throw new Error(`Google Chrome not found at ${chromePath}`);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  const title = await page.title();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const screenshot = `${OUT_DIR}/playwright-installed-google-chrome.png`;

  await page.screenshot({ path: screenshot, fullPage: true });
  await browser.close();

  console.log({ title, bodyText: bodyText.slice(0, 160), screenshot });
}

async function testPuppeteerChrome() {
  console.log('\n[4] Testing Puppeteer with installed Google Chrome...');
  const puppeteer = await import('puppeteer');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  if (!fs.existsSync(chromePath)) {
    throw new Error(`Google Chrome not found at ${chromePath}`);
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath: chromePath
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText || '');
  const screenshot = `${OUT_DIR}/puppeteer-installed-google-chrome.png`;

  await page.screenshot({ path: screenshot, fullPage: true });
  await browser.close();

  console.log({ title, bodyText: bodyText.slice(0, 160), screenshot });
}

const tests = [
  ['fetch/curl equivalent', testCurl],
  ['Playwright bundled Chromium', testPlaywrightBundled],
  ['Playwright installed Chrome', testPlaywrightChrome],
  ['Puppeteer installed Chrome', testPuppeteerChrome],
];

for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`✅ ${name} works`);
  } catch (err) {
    console.log(`❌ ${name} failed`);
    console.log(err?.message || err);
  }
}

console.log(`\nScreenshots saved in: ${OUT_DIR}`);
