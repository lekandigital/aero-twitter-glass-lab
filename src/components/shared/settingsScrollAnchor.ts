export type SettingsScrollAnchor = {
  sectionKey: string;
  domId: string | null;
  offsetWithinSection: number;
};

const ANCHOR_VIEW_OFFSET = 56;

export function captureSettingsScrollAnchor(container: HTMLElement): SettingsScrollAnchor | null {
  const anchorY = container.scrollTop + ANCHOR_VIEW_OFFSET;
  const sections = container.querySelectorAll<HTMLElement>('[data-foldable-section]');

  let sectionKey: string | null = null;
  let domId: string | null = null;
  let offsetWithinSection = 0;

  for (const section of sections) {
    const top = section.offsetTop;
    if (top > anchorY) break;
    sectionKey = section.dataset.foldableSection ?? null;
    domId = section.dataset.foldableDomId ?? null;
    offsetWithinSection = anchorY - top;
  }

  if (!sectionKey) return null;
  return { sectionKey, domId, offsetWithinSection };
}

export function restoreSettingsScrollAnchor(
  container: HTMLElement,
  anchor: SettingsScrollAnchor | null,
): void {
  if (!anchor) return;

  const byDomId = anchor.domId
    ? container.querySelector<HTMLElement>(`[data-foldable-dom-id="${cssEscape(anchor.domId)}"]`)
    : null;
  const target =
    byDomId ??
    container.querySelector<HTMLElement>(`[data-foldable-section="${cssEscape(anchor.sectionKey)}"]`);

  if (!target) return;

  container.scrollTop = Math.max(0, target.offsetTop + anchor.offsetWithinSection - ANCHOR_VIEW_OFFSET);
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && 'escape' in CSS) {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}
