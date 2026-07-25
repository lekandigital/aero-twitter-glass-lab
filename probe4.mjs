import pw from '/Users/lekan/Dev/aero-twitter-glass-lab/node_modules/playwright/index.js';
const { chromium } = pw;
const SD='/private/tmp/claude-501/-Users-lekan-Dev-aero-twitter-glass-lab/2208bf46-d3bb-482c-bf26-dfb8d6d2f62c/scratchpad';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1500,height:950}, deviceScaleFactor:2 });
await p.goto('http://localhost:5173/experiment-set-1', { waitUntil:'networkidle' });
await p.waitForTimeout(1200);
await p.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('experiment-set-1-session'));
  s.activeExperiment='eleven'; s.selectedExperimentIds=['eleven'];
  s.selectedSaveIdByExperiment={...(s.selectedSaveIdByExperiment||{}),eleven:1037};
  s.selectedSaveKeysByExperiment={...(s.selectedSaveKeysByExperiment||{}),eleven:['center-overlap-pane:1037']};
  s.layerCVisible=true; s.layerAVisible=true; s.experimentVisible=true;
  s.referenceWallpaper=true; s.hidePanelText=true;
  localStorage.setItem('experiment-set-1-session', JSON.stringify(s));
});
await p.reload({ waitUntil:'networkidle' });
await p.waitForTimeout(2500);

// Inject a high-frequency test pattern BEHIND the glass, inside its backdrop root.
await p.evaluate(() => {
  const glass = [...document.querySelectorAll('.experiment-eleven-ref-glass--thick-lens')]
    .find(e => e.getBoundingClientRect().width > 200);
  const layerA = glass.closest('.experiment-four-layer-a');
  const pat = document.createElement('div');
  pat.id = '__pattern';
  pat.style.cssText = `position:absolute;inset:0;z-index:2;pointer-events:none;
    background-image:repeating-linear-gradient(0deg,#000 0 12px,#fff 12px 24px),
                     repeating-linear-gradient(90deg,rgba(255,0,0,.6) 0 12px,rgba(0,0,255,.6) 12px 24px);
    background-blend-mode:difference;`;
  layerA.appendChild(pat);
});
await p.waitForTimeout(600);
const box = { x: 416-40, y: 336-40, width: 400, height: 280 };
await p.screenshot({ path: SD+'/pattern-with-filter.png', clip: box });

await p.evaluate(() => {
  const g = [...document.querySelectorAll('.experiment-eleven-ref-glass--thick-lens')].find(e=>e.getBoundingClientRect().width>200);
  g.style.backdropFilter='none'; g.style.webkitBackdropFilter='none';
});
await p.waitForTimeout(400);
await p.screenshot({ path: SD+'/pattern-no-filter.png', clip: box });
await b.close();
