/*
 * Experiment Five showcase — two modes:
 *   FOCUS: one item, big and centred, the reference image stacked UNDER each demo for
 *          glance comparison; switch via the rail or ←/→. Free-move on by default (native
 *          drag → live-correct lighting). "Reference between" interleaves the reference as
 *          its own step between demos while arrowing. Screenshot = just the demo + its bg.
 *   GRID:  every branch as a tile (reference stacked under each); click a tile → opens it
 *          fullscreen in Focus, then arrow through the rest.
 *
 * Panels are real builds in same-origin iframes, positioned natively at the snap point.
 * Cards are only transformed (never reparented) and hidden via visibility (so the panel's
 * drag bounds stay measured and the snap position isn't clamped to 0,0).
 */
import {
  STAGE, loadBranches, createPanel, refreshReflex, setBg, setHideText,
  captureElement, toggleFullscreen, REF_SRC,
} from './common.js';

const VIEW_W = STAGE.w, VIEW_H = STAGE.h;
const REF_IMG_H = 961, REF_GAP = 24, LABEL_H = 110, GAP = 28;

const stage = document.getElementById('stage');
const stagewrap = document.getElementById('stagewrap');
const railEl = document.getElementById('rail');
const ctlEl = document.getElementById('ctl');
const work = document.querySelector('.work');

let items = [];               // { el, view, ref?, handle?, kind:'panel'|'ref', label, save? }
let mode = 'focus';
let nav = [];                 // ordered item indices for arrow navigation
let navPos = 0;
let freeMove = true, hideText = true, bgRef = false, refRow = true, interleave = false, zoom = 1;

const refIndex = () => items.length - 1;
const current = () => items[nav[navPos]];

function goFullscreen() { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); } catch {} }

// ---------- build ----------
function makeCard(kind, label, inner, withRef) {
  const el = document.createElement('div');
  el.className = `card card--${kind} is-hidden`;
  const lab = document.createElement('div'); lab.className = 'card__label'; lab.textContent = label;
  const view = document.createElement('div'); view.className = 'card__view'; view.appendChild(inner);
  el.append(lab, view);
  let ref = null;
  if (withRef) {
    ref = document.createElement('div'); ref.className = 'card__ref';
    const img = document.createElement('img'); img.src = REF_SRC; img.alt = 'reference';
    ref.appendChild(img);
    el.appendChild(ref);
  }
  stage.appendChild(el);
  return { el, view, ref };
}

function build(branches) {
  items = branches.map((b, i) => {
    const h = createPanel(b); h.hideText = true;
    const { el, view, ref } = makeCard('panel', `${b.label} · Save ${b.save}`, h.iframe, true);
    el.addEventListener('click', () => { if (mode === 'grid') focus(i, true); });
    return { el, view, ref, handle: h, kind: 'panel', label: b.label, save: b.save };
  });
  const img = document.createElement('img'); img.src = REF_SRC; img.alt = 'Reference'; img.className = 'ref-full';
  const { el, view } = makeCard('ref', 'Reference target', img, false);
  el.addEventListener('click', () => { if (mode === 'grid') focus(refIndex(), true); });
  items.push({ el, view, kind: 'ref', label: 'Reference' });
  buildRail();
}

function buildRail() {
  railEl.innerHTML = '';
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.className = 'railitem' + (it.kind === 'ref' ? ' railitem--ref' : '');
    b.innerHTML = it.kind === 'ref' ? `<span>Reference</span><em>target</em>` : `<span>${it.label}</span><em>Save ${it.save}</em>`;
    b.addEventListener('click', () => focus(i));
    railEl.appendChild(b);
  });
}

// ---------- navigation order ----------
function rebuildNav() {
  const panels = items.map((_, i) => i).filter((i) => items[i].kind === 'panel');
  nav = interleave ? panels.flatMap((i) => [i, refIndex()]) : [...panels, refIndex()];
}

// ---------- layout ----------
function contentH(it) { return it.kind === 'ref' ? REF_IMG_H : VIEW_H + (refRow ? REF_GAP + REF_IMG_H : 0); }

function place(card, x, y, scale, withLabel) {
  card.el.classList.toggle('card--labelled', withLabel);
  card.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

function layout() {
  const W = stagewrap.clientWidth, H = stagewrap.clientHeight;
  items.forEach((it) => { if (it.ref) it.ref.style.display = refRow ? 'block' : 'none'; });

  if (mode === 'grid') {
    stagewrap.classList.add('is-grid');
    const panels = items.filter((it) => it.kind === 'panel');
    const cols = Math.max(2, Math.min(panels.length, Math.floor((W - GAP) / (320 + GAP))));
    const tileW = (W - (cols + 1) * GAP) / cols;
    const scale = tileW / VIEW_W;
    const cardH = (LABEL_H + contentH(panels[0])) * scale;
    items.forEach((it) => { it.el.classList.add('is-hidden'); });
    panels.forEach((it, i) => {
      it.el.classList.remove('is-hidden');
      it.el.style.pointerEvents = 'auto';
      const col = i % cols, row = Math.floor(i / cols);
      place(it, GAP + col * (tileW + GAP), GAP + row * (cardH + GAP), scale, true);
      if (it.handle) setTimeout(() => refreshReflex(it.handle), 90);
    });
    stage.style.height = `${GAP + Math.ceil(panels.length / cols) * (cardH + GAP)}px`;
  } else {
    stagewrap.classList.remove('is-grid');
    stage.style.height = '100%';
    const f = current();
    items.forEach((it) => { it.el.classList.add('is-hidden'); it.el.style.pointerEvents = 'none'; });
    const ch = contentH(f);
    const scale = Math.min(W * 0.94 / VIEW_W, H * 0.94 / ch) * zoom;
    f.el.classList.remove('is-hidden');
    f.el.style.pointerEvents = freeMove && f.kind === 'panel' ? 'auto' : 'none';
    place(f, (W - VIEW_W * scale) / 2, (H - ch * scale) / 2, scale, false);
    if (f.handle) setTimeout(() => refreshReflex(f.handle), 90);
  }
  updateRail();
}

function updateRail() {
  [...railEl.children].forEach((c, i) => c.classList.toggle('is-active', mode === 'focus' && i === nav[navPos]));
}

// ---------- modes ----------
function setMode(m) {
  mode = m;
  document.getElementById('mFocus').classList.toggle('is-active', m === 'focus');
  document.getElementById('mGrid').classList.toggle('is-active', m === 'grid');
  work.classList.toggle('is-grid', m === 'grid');
  buildCtl();
  layout();
}
function focus(itemIndex, fullscreen) {
  rebuildNav();
  navPos = Math.max(0, nav.indexOf(itemIndex));
  setMode('focus');
  if (fullscreen) goFullscreen();
}
function step(dir) { navPos = (navPos + dir + nav.length) % nav.length; layout(); }

// ---------- controls ----------
function buildCtl() {
  ctlEl.innerHTML = '';
  if (mode !== 'focus') {
    ctlEl.append(toggle('Reference row', refRow, (v) => { refRow = v; layout(); }));
    return;
  }
  const isPanel = current().kind === 'panel';
  ctlEl.append(
    toggle('Free move', freeMove, (v) => { freeMove = v; layout(); }, !isPanel),
    toggle('Reference row', refRow, (v) => { refRow = v; layout(); }),
    toggle('Reference between', interleave, (v) => { interleave = v; const cur = nav[navPos]; rebuildNav(); navPos = Math.max(0, nav.indexOf(cur)); layout(); }),
    toggle('Reference bg', bgRef, (v) => { bgRef = v; items.forEach((it) => it.handle && setBg(it.handle, v ? 'reference' : 'current')); }, !isPanel),
    toggle('Text', !hideText, (v) => { hideText = !v; items.forEach((it) => it.handle && setHideText(it.handle, hideText)); }, !isPanel),
    zoomCtl(),
  );
}
function zoomCtl() {
  const w = document.createElement('label'); w.className = 'zoom';
  w.innerHTML = `Zoom <input type="range" min="0.4" max="1.8" step="0.01" value="${zoom}">`;
  w.querySelector('input').oninput = (e) => { zoom = Number(e.target.value); layout(); };
  return w;
}
function toggle(label, checked, onchange, disabled) {
  const l = document.createElement('label'); l.className = 'toggle' + (disabled ? ' is-disabled' : '');
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = checked; i.disabled = !!disabled;
  i.onchange = () => onchange(i.checked);
  l.append(i, document.createTextNode(' ' + label));
  return l;
}

// ---------- boot ----------
(async function main() {
  const branches = await loadBranches();
  build(branches);
  rebuildNav();
  document.getElementById('mFocus').onclick = () => setMode('focus');
  document.getElementById('mGrid').onclick = () => setMode('grid');
  document.getElementById('shot').onclick = () => captureElement(current().view, `experiment-five-${current().label.replace(/\s+/g, '-').toLowerCase()}.png`);
  document.getElementById('full').onclick = () => toggleFullscreen(document.documentElement);
  window.addEventListener('resize', layout);
  window.addEventListener('keydown', (e) => {
    if (mode !== 'focus') return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'g') setMode('grid');
  });
  setMode('focus');
})();
