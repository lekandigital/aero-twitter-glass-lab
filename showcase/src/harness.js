/*
 * Showcase harness (runs on the PARENT page, both grid + switch views).
 *
 * Each branch is its own real production build under panels/<slug>/. We load it in a
 * SAME-ORIGIN iframe, seed the session so it boots Experiment Five, navigate to the
 * Experiment-Set-1 route client-side (no server round-trip), then inject normalize.css
 * to strip chrome and pin the panel geometry/position. Because the iframe is same-origin
 * we can drive its DOM and share localStorage with it.
 */

const NAV_HREF = '/experiment-set-1';
const PANEL_SELECTOR = '.experiment-four-layer-a';
const STAGE_LOGICAL = { w: 1440, h: 1572 };

// Each branch build self-seeds Experiment Five + its specific save via an in-iframe
// localStorage shim (injected at build time), so no parent-level seeding is needed here.

function waitFor(getter, { tries = 120, interval = 80 } = {}) {
  return new Promise((resolve) => {
    let n = 0;
    const tick = () => {
      let found = null;
      try { found = getter(); } catch { /* cross-doc not ready */ }
      if (found) return resolve(found);
      if (++n >= tries) return resolve(null);
      setTimeout(tick, interval);
    };
    tick();
  });
}

function injectNormalize(doc) {
  if (doc.getElementById('showcase-normalize')) return;
  const link = doc.createElement('link');
  link.id = 'showcase-normalize';
  link.rel = 'stylesheet';
  link.href = '/normalize.css';
  doc.head.appendChild(link);
}

async function drive(iframe) {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) return;

  // 1. Client-side navigate to the Experiment-Set-1 route via the app's own NavLink.
  const link = await waitFor(() => doc.querySelector(`a[href="${NAV_HREF}"]`));
  if (link) {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: win, button: 0 }));
  }

  // 2. Wait for the Experiment-Five panel, then strip chrome + pin geometry.
  const panel = await waitFor(() => doc.querySelector(PANEL_SELECTOR));
  injectNormalize(doc);

  iframe.dataset.ready = panel ? 'true' : 'partial';
}

function makeStage(branch, scale) {
  const frame = document.createElement('div');
  frame.className = 'stage';
  frame.style.width = `${STAGE_LOGICAL.w * scale}px`;
  frame.style.height = `${STAGE_LOGICAL.h * scale}px`;

  const iframe = document.createElement('iframe');
  iframe.className = 'stage__frame';
  iframe.title = branch.label;
  iframe.width = STAGE_LOGICAL.w;
  iframe.height = STAGE_LOGICAL.h;
  iframe.style.transform = `scale(${scale})`;
  iframe.loading = 'eager';
  iframe.src = `panels/${branch.slug}/index.html`;
  iframe.addEventListener('load', () => drive(iframe));

  frame.appendChild(iframe);
  return { frame, iframe };
}

async function loadBranches() {
  const res = await fetch('branches.json');
  return res.json();
}

async function initGrid(branches) {
  const root = document.getElementById('grid');
  const scale = Number(root.dataset.scale || 0.32);
  for (const branch of branches) {
    const tile = document.createElement('figure');
    tile.className = 'tile';
    const cap = document.createElement('figcaption');
    cap.className = 'tile__cap';
    cap.textContent = branch.save != null ? `${branch.label} · Save ${branch.save}` : branch.label;
    const { frame } = makeStage(branch, scale);
    tile.appendChild(cap);
    tile.appendChild(frame);
    root.appendChild(tile);
  }
}

async function initSwitch(branches) {
  const root = document.getElementById('switch');
  const bar = document.getElementById('switch-bar');
  const scale = Number(root.dataset.scale || 0.62);

  const stages = [];
  branches.forEach((branch, i) => {
    const { frame, iframe } = makeStage(branch, scale);
    frame.classList.add('switch-stage');
    frame.style.display = i === 0 ? 'block' : 'none';
    root.appendChild(frame);
    stages.push(frame);

    const btn = document.createElement('button');
    btn.className = 'switch-btn' + (i === 0 ? ' is-active' : '');
    btn.textContent = branch.save != null ? `${branch.label} · ${branch.save}` : branch.label;
    btn.addEventListener('click', () => {
      stages.forEach((s, j) => (s.style.display = j === i ? 'block' : 'none'));
      bar.querySelectorAll('.switch-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
    bar.appendChild(btn);
    void iframe;
  });
}

(async function main() {
  const branches = await loadBranches();
  if (document.body.dataset.mode === 'switch') {
    await initSwitch(branches);
  } else {
    await initGrid(branches);
  }
})();
