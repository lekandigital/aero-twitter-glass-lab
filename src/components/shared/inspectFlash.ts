export const INSPECT_FLASH_MS = 700;

const BLINK_CLASS_BY_EXPERIMENT = {
  one: 'e1-inspect-blink',
  two: 'e2-inspect-blink',
  three: 'e3-inspect-blink',
  four: 'e4-inspect-blink',
} as const;

const ALL_BLINK_CLASSES = Object.values(BLINK_CLASS_BY_EXPERIMENT);

let activeEl: HTMLElement | null = null;
let activeTimer: ReturnType<typeof setTimeout> | null = null;

function clearActiveFlash() {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
  if (activeEl) {
    activeEl.classList.remove(...ALL_BLINK_CLASSES);
    activeEl = null;
  }
}

export function flashInspectElement(el: HTMLElement, experiment: keyof typeof BLINK_CLASS_BY_EXPERIMENT) {
  clearActiveFlash();
  const blinkClass = BLINK_CLASS_BY_EXPERIMENT[experiment];
  el.classList.add(blinkClass);
  activeEl = el;
  activeTimer = setTimeout(() => {
    el.classList.remove(blinkClass);
    if (activeEl === el) activeEl = null;
    activeTimer = null;
  }, INSPECT_FLASH_MS);
}

export function clearInspectFlash() {
  clearActiveFlash();
}
