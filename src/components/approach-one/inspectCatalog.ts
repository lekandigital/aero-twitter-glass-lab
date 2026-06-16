import type { A1MaterialSettings } from './materialSettings';

/* Approach 1 — per-element inspect targets */

export type A1InspectTarget =
  | 'panel'
  | 'highlight-rim-top'
  | 'highlight-inner-border'
  | 'highlight-blue-shadow'
  | 'highlight-sheen'
  | 'highlight-sparkle'
  | 'background'
  | 'bubble'
  | 'button-primary'
  | 'button-glass'
  | 'icon-button'
  | 'nav-pill'
  | 'card'
  | 'search'
  | 'composer'
  | 'chip'
  | 'segmented'
  | 'avatar'
  | 'typography'
  | 'badge';

type InspectMeta = {
  label: string;
  fields: (keyof A1MaterialSettings)[];
  note?: string;
};

const palette: (keyof A1MaterialSettings)[] = ['colorCyan', 'colorBlue', 'colorDeepBlue'];

export const A1_INSPECT_CATALOG: Record<A1InspectTarget, InspectMeta> = {
  panel: {
    label: 'Glass panel',
    fields: [
      'panelBlur',
      'panelSaturate',
      'panelBrightness',
      'cornerRadius',
      'panelFillOpacity',
      'panelTintOpacity',
      'panelBorderOpacity',
      'rimOpacity',
      'innerBevelOpacity',
      'topShineOpacity',
      'topRadialOpacity',
      'bottomDepthOpacity',
      'outerShadowOpacity',
      'outerShadowSpread',
      'hoverBorderOpacity',
      'hoverShadowOpacity',
      ...palette,
    ],
  },
  'highlight-rim-top': {
    label: 'Rim top highlight',
    fields: ['highlightRimTop', ...palette],
  },
  'highlight-inner-border': {
    label: 'Inner border highlight',
    fields: ['highlightInnerBorder', ...palette],
  },
  'highlight-blue-shadow': {
    label: 'Blue shadow highlight',
    fields: ['highlightBlueShadow', 'colorDeepBlue', ...palette],
  },
  'highlight-sheen': {
    label: 'Refraction sheen',
    fields: ['highlightSheen', ...palette],
  },
  'highlight-sparkle': {
    label: 'Sparkle highlight',
    fields: ['highlightSparkle', 'sparkleOpacity', ...palette],
  },
  background: {
    label: 'Background FX layer',
    fields: ['bgFlareTop', 'bgFlareBottom', 'bubbleOpacity', 'sparkleOpacity', 'showBubbles', 'showSparkles'],
  },
  bubble: {
    label: 'Bubble ornament',
    fields: ['bubbleOpacity', 'showBubbles', 'bgFlareTop', 'bgFlareBottom'],
  },
  'button-primary': {
    label: 'Primary glossy button',
    fields: ['btnPrimaryGloss', 'btnPrimaryShadow', ...palette],
  },
  'button-glass': {
    label: 'Glass pill button',
    fields: ['btnGlassFill', 'btnGlassBlur', ...palette],
  },
  'icon-button': {
    label: 'Circular icon button',
    fields: ['iconBtnFill', 'iconBtnRim', ...palette],
  },
  'nav-pill': {
    label: 'Navigation pill',
    fields: ['navActiveFill', 'navHoverFill', ...palette],
  },
  card: {
    label: 'Feed card',
    fields: ['cardFillOpacity', 'cardBorderOpacity', 'cardShineOpacity', 'cardShadowOpacity', ...palette],
  },
  search: {
    label: 'Search pill',
    fields: ['searchFillOpacity', 'searchBlur', 'searchRimOpacity', ...palette],
  },
  composer: {
    label: 'Composer input',
    fields: ['composerFillOpacity', 'composerBorderOpacity', ...palette],
  },
  chip: {
    label: 'Filter chip',
    fields: ['chipFillOpacity', 'chipBlur', ...palette],
  },
  segmented: {
    label: 'Segmented control',
    fields: ['segmentedBgOpacity', ...palette],
  },
  avatar: {
    label: 'Avatar',
    fields: palette,
    note: 'Avatar gradient uses palette cyan and blue.',
  },
  typography: {
    label: 'Muted typography',
    fields: ['textMutedOpacity'],
  },
  badge: {
    label: 'Notification badge',
    fields: [],
    note: 'Badge uses a fixed red gradient in CSS — no material variables yet.',
  },
};

export function isA1InspectTarget(value: string): value is A1InspectTarget {
  return value in A1_INSPECT_CATALOG;
}

export function a1InspectAttrs(target: A1InspectTarget, label?: string) {
  return {
    'data-a1-inspect': target,
    'data-a1-inspect-label': label ?? A1_INSPECT_CATALOG[target].label,
  };
}
