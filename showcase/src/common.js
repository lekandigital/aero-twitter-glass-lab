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

  // normalize + native snap position are injected at BUILD time (in <head>), so the panel
  // is already laid out and lit correctly. Here we only add a tiny style for text hiding.
  let ctl = d.getElementById('showcase-ctl');
  if (!ctl) { ctl = d.createElement('style'); ctl.id = 'showcase-ctl'; d.head.appendChild(ctl); }

  h._ctl = ctl; h._doc = d;
  h._img = d.querySelector('.aero-wallpaper__image');
  h.ready = true;
  applyCtl(h);
  if (h.onReady) h.onReady(h);
  // The reflex samples once on load — often before the panel has settled at its native
  // position. Nudge it a few times so it re-samples at the final spot (only effective while
  // the panel is visible; views also call refreshReflex when a panel becomes visible).
  [150, 500, 1200].forEach((t) => setTimeout(() => refreshReflex(h), t));
}

/*
 * The edge-reflex lighting samples the wallpaper at the panel's getBoundingClientRect and
 * only recomputes when its hook re-runs — it listens for a window 'resize' (among others).
 * Whenever WE move/resize the panel via CSS, the app doesn't know, so the lighting goes
 * stale. Dispatching 'resize' into the iframe forces it to re-sample at the new rect,
 * matching the native drag behaviour. (rAF inside the hook reads the rect after layout.)
 */
export function refreshReflex(h) {
  if (!h.ready) return;
  try { h.iframe.contentWindow.dispatchEvent(new Event('resize')); } catch { /* cross-doc */ }
}

// Position/size/chrome are native + build-time; the only runtime override is text hiding
// (it doesn't touch the panel edges, so the lighting is unaffected).
export function applyCtl(h) {
  if (!h._ctl) return;
  h._ctl.textContent = h.hideText
    ? `.experiment-four-layer-a__content,.experiment-four-layer-b__content{display:none!important}`
    : '';
}

export function setHideText(h, hide) { h.hideText = hide; applyCtl(h); }
export function setBg(h, which) {
  const src = which === 'reference' ? '/reference.png' : '/aero-bg.png';
  const set = () => { if (h._img) { h._img.src = src; h._img.addEventListener('load', () => refreshReflex(h), { once: true }); } };
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

export const REF_SRC = 'reference.png';

/*
 * Save a PNG of the current tab. iframe content can't be captured by html2canvas, so we
 * use the Screen Capture API (preferring the current tab) to grab one composited frame —
 * the only reliable way to screenshot the rendered glass + backgrounds together.
 */
export async function captureScreenshot(name = 'experiment-five.png') {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    alert('Screenshot needs the Screen Capture API. Use your OS screenshot instead (⌘⇧4).');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: { ideal: 3840 } }, audio: false,
      preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude',
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => setTimeout(r, 180));
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    c.getContext('2d').drawImage(video, 0, 0);
    stream.getTracks().forEach((t) => t.stop());
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  } catch (err) {
    console.warn('[showcase] screenshot cancelled/failed', err);
  }
}
