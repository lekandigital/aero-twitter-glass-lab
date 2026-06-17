/*
 * Shared engine for all showcase views.
 *
 * Each branch is its own real production build in a SAME-ORIGIN iframe. We drive it into
 * Experiment Five, inject the base normalize stylesheet (strip chrome, fix wrapper, pin
 * panel SIZE), and an injectable #showcase-ctl <style> we rewrite at runtime to control
 * panel POSITION + text visibility. The background image src is swapped directly in the
 * iframe DOM to flip current/reference. backdrop-filter samples the iframe's own bg, so
 * the bg must stay inside each iframe (it can't live in the parent).
 */

export const STAGE = { w: 1440, h: 1572 };       // logical coordinate space (= wallpaper box)
export const SNAP = { x: 24.61, y: 327.55 };      // Panel A target, relative to bg top-left
const NAV = '/experiment-set-1';
const PANEL = '.experiment-four-layer-a';

export function waitFor(getter, { tries = 160, interval = 80 } = {}) {
  return new Promise((resolve) => {
    let n = 0;
    const tick = () => {
      let v = null;
      try { v = getter(); } catch { /* cross-doc not ready */ }
      if (v) return resolve(v);
      if (++n >= tries) return resolve(null);
      setTimeout(tick, interval);
    };
    tick();
  });
}

export async function loadBranches() {
  const res = await fetch('branches.json');
  return res.json();
}

/** Create a branch panel handle (iframe + control API). Call mount() to attach + drive. */
export function createPanel(branch) {
  const iframe = document.createElement('iframe');
  iframe.className = 'panel-iframe';
  iframe.title = branch.label;
  iframe.width = STAGE.w;
  iframe.height = STAGE.h;
  iframe.scrolling = 'no';
  iframe.src = `panels/${branch.slug}/index.html`;

  const h = {
    branch, iframe,
    x: SNAP.x, y: SNAP.y, hideText: false,
    ready: false, onReady: null,
    _ctl: null, _doc: null, _img: null,
  };
  iframe.addEventListener('load', () => drive(h));
  return h;
}

async function drive(h) {
  const w = h.iframe.contentWindow;
  const d = h.iframe.contentDocument;
  if (!w || !d) return;

  const link = await waitFor(() => d.querySelector(`a[href="${NAV}"]`));
  if (link) link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: w, button: 0 }));

  await waitFor(() => d.querySelector(PANEL));

  if (!d.getElementById('showcase-normalize')) {
    const l = d.createElement('link');
    l.id = 'showcase-normalize'; l.rel = 'stylesheet'; l.href = '/normalize.css';
    d.head.appendChild(l);
  }
  let ctl = d.getElementById('showcase-ctl');
  if (!ctl) { ctl = d.createElement('style'); ctl.id = 'showcase-ctl'; d.head.appendChild(ctl); }

  h._ctl = ctl; h._doc = d;
  h._img = d.querySelector('.aero-wallpaper__image');
  h.ready = true;
  applyCtl(h);
  if (h.onReady) h.onReady(h);
}

export function applyCtl(h) {
  if (!h._ctl) return;
  let css = `.experiment-set-two-draggable{transform:translate(${h.x}px,${h.y}px)!important;transition:none!important}`;
  if (h.hideText) {
    css += `.experiment-four-layer-a__content,.experiment-four-layer-b__content{display:none!important}`;
  }
  h._ctl.textContent = css;
}

export function setPos(h, x, y) { h.x = x; h.y = y; applyCtl(h); }
export function snapPos(h) { setPos(h, SNAP.x, SNAP.y); }
export function setHideText(h, hide) { h.hideText = hide; applyCtl(h); }
export function setBg(h, which) {
  const src = which === 'reference' ? '/reference.png' : '/aero-bg.png';
  const set = () => { if (h._img) h._img.src = src; };
  if (h.ready) set(); else h.onReady = (() => { const p = h.onReady; return (x) => { p && p(x); set(); }; })();
}

/** Fit `inner` (logical px) into `outer` (px), returning a scale factor (optionally capped). */
export function fitScale(outerW, outerH, innerW = STAGE.w, innerH = STAGE.h, cap = Infinity) {
  return Math.min(cap, outerW / innerW, outerH / innerH);
}

/** Toggle fullscreen on an element. */
export function toggleFullscreen(el) {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (el.requestFullscreen) el.requestFullscreen();
}
