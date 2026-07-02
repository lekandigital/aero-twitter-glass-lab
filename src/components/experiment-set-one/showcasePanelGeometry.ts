import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';

/** Logical stage — same coordinate basis as showcase normalize.css / `.aero-wallpaper__image`. */
export const SHOWCASE_STAGE = { w: 1440, h: 1572 } as const;

/** Visible demo height — landscape image area inside the 1572px portrait box (showcase VIEW_H). */
export const SHOWCASE_IMAGE_VIEW_HEIGHT = 961;

/** Letterbox crop: iframe shifted up by this amount in showcase.css (`top: -306px`). */
export const SHOWCASE_LETTERBOX_OFFSET_Y = Math.round((SHOWCASE_STAGE.h - SHOWCASE_IMAGE_VIEW_HEIGHT) / 2);

/** Panel A position relative to the 1440×1572 stage (bg image box top-left). */
export const SHOWCASE_PANEL_SNAP = { x: 24.61, y: 327.55 } as const;

/** Panel A/B size — 316×760 outer, 6px bezel → 304×748 inner, radii 30/24. */
export const SHOWCASE_PANEL_LAYOUT = {
  layerAWidth: 316,
  layerAHeight: 760,
  layerACornerRadius: 30,
  layerABezelInsetX: 6,
  layerABezelInsetY: 6,
  layerBWidth: 304,
  layerBHeight: 748,
  layerBCornerRadius: 24,
} as const;

/** Independent Layer B position if not nested (showcase reference). */
export const SHOWCASE_PANEL_B_SNAP = {
  x: SHOWCASE_PANEL_SNAP.x + SHOWCASE_PANEL_LAYOUT.layerABezelInsetX,
  y: SHOWCASE_PANEL_SNAP.y + SHOWCASE_PANEL_LAYOUT.layerABezelInsetY,
} as const;

export function applyShowcasePanelGeometry(s: E4MaterialSettings): E4MaterialSettings {
  return {
    ...s,
    layerACornerRadius: s.layerACornerRadius ?? SHOWCASE_PANEL_LAYOUT.layerACornerRadius,
    layerABezelInsetX: s.layerABezelInsetX ?? SHOWCASE_PANEL_LAYOUT.layerABezelInsetX,
    layerABezelInsetY: s.layerABezelInsetY ?? SHOWCASE_PANEL_LAYOUT.layerABezelInsetY,
  };
}
