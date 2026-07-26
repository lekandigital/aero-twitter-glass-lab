export type ShowcaseGeometry = Readonly<{
  width: number;
  height: number;
  radius: number;
}>;

export type ShowcaseSpring = Readonly<{
  stiffness: number;
  damping: number;
}>;

export type ShowcaseRgba = Readonly<{
  r: number;
  g: number;
  b: number;
  a: number;
}>;

export type ShowcaseLiquidGlassFamilyKey =
  | 'ios-action'
  | 'menu-dots'
  | 'notification-center'
  | 'video-control';

export type ShowcaseLiquidGlassFamily = Readonly<{
  key: ShowcaseLiquidGlassFamilyKey;
  hoverScale: number;
  pressScale: number;
  scaleSpring: ShowcaseSpring;
  optics: Readonly<{
    blendSupportGating: false;
    blur: number;
    spacing?: number;
    bezelWidth: number;
    thickness?: number;
    displacementBlur?: number;
    ior?: number;
    contentIor?: number;
    contentDepth?: number;
    tint: ShowcaseRgba;
    shadowColor: ShowcaseRgba;
    shadowOffsetY: number;
    shadowBlur: number;
    specularOpacity: number;
  }>;
}>;

export const SHOWCASE_LIQUID_GLASS_FAMILIES = {
  'ios-action': {
    key: 'ios-action',
    hoverScale: 1.035,
    pressScale: 0.96,
    scaleSpring: { stiffness: 520, damping: 42 },
    optics: {
      blendSupportGating: false,
      blur: 12,
      spacing: 10,
      bezelWidth: 18,
      tint: { r: 0.82, g: 0.92, b: 0.95, a: 0.22 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.2 },
      shadowOffsetY: 7,
      shadowBlur: 21,
      specularOpacity: 0.6,
    },
  },
  'menu-dots': {
    key: 'menu-dots',
    hoverScale: 1.08,
    pressScale: 0.94,
    scaleSpring: { stiffness: 155, damping: 24 },
    optics: {
      blendSupportGating: false,
      blur: 20,
      spacing: 37,
      bezelWidth: 70,
      thickness: 40,
      displacementBlur: 20,
      contentIor: 1,
      contentDepth: 0,
      tint: { r: 1, g: 1, b: 1, a: 0.5 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.14 },
      shadowOffsetY: 18,
      shadowBlur: 46,
      specularOpacity: 0.7,
    },
  },
  'notification-center': {
    key: 'notification-center',
    hoverScale: 1.08,
    pressScale: 0.94,
    scaleSpring: { stiffness: 720, damping: 42 },
    optics: {
      blendSupportGating: false,
      blur: 4,
      bezelWidth: 10,
      thickness: 20,
      tint: { r: 1, g: 1, b: 1, a: 0.18 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.16 },
      shadowOffsetY: 10,
      shadowBlur: 22,
      specularOpacity: 0.5,
    },
  },
  'video-control': {
    key: 'video-control',
    hoverScale: 1.1,
    pressScale: 0.94,
    scaleSpring: { stiffness: 700, damping: 38 },
    optics: {
      blendSupportGating: false,
      ior: 1.5,
      blur: 4,
      spacing: 24,
      bezelWidth: 30,
      thickness: 30,
      tint: { r: 0, g: 0, b: 0, a: 0.25 },
      shadowColor: { r: 0, g: 0, b: 0, a: 0.22 },
      shadowOffsetY: 8,
      shadowBlur: 22,
      specularOpacity: 0.54,
    },
  },
} as const satisfies Record<
  ShowcaseLiquidGlassFamilyKey,
  ShowcaseLiquidGlassFamily
>;

type ShowcaseButtonBase = Readonly<{
  id: `liquid-dom-showcase:${string}`;
  geometry: ShowcaseGeometry;
  sourceMode: 'html-css' | 'liquid-dom-webgpu';
}>;

export type ShowcaseTabConfig = ShowcaseButtonBase &
  Readonly<{
    kind: 'tab';
    text: string;
    initiallySelected: boolean;
  }>;

export type ShowcaseControlConfig = ShowcaseButtonBase &
  Readonly<{
    kind: 'control-center';
    control:
      | 'airplane'
      | 'airdrop'
      | 'wifi'
      | 'small-grid'
      | 'airplay'
      | 'skip-back'
      | 'play'
      | 'skip-forward';
  }>;

export type ShowcaseToggleConfig = ShowcaseButtonBase &
  Readonly<{
    kind: 'toggle';
    theme: 'ios-night-mode' | 'menu-slow-mo';
    text: 'Night mode' | 'Slow mo';
  }>;

export type ShowcaseSidebarConfig = ShowcaseButtonBase &
  Readonly<{
    kind: 'music-sidebar';
    item:
      | 'search'
      | 'home'
      | 'new'
      | 'radio'
      | 'recently-added'
      | 'artists'
      | 'albums'
      | 'songs'
      | 'made-for-you'
      | 'all-playlists'
      | 'favourite-songs';
    text: string;
    icon:
      | 'Search'
      | 'House'
      | 'Grid2X2'
      | 'Radio'
      | 'Clock3'
      | 'MicVocal'
      | 'Album'
      | 'Music'
      | 'SquareUserRound'
      | 'Grid3X3'
      | 'Star';
    initiallySelected: boolean;
  }>;

export type ShowcaseGlassConfig = ShowcaseButtonBase &
  Readonly<{
    kind: 'liquid-glass';
    family: ShowcaseLiquidGlassFamilyKey;
    content:
      | 'ios-options'
      | 'ios-clear'
      | 'menu-dots'
      | 'notification-flashlight'
      | 'notification-camera'
      | 'video-rewind-10'
      | 'video-forward-10'
      | 'video-play';
  }>;

export type LiquidDomShowcaseButtonConfig =
  | ShowcaseTabConfig
  | ShowcaseControlConfig
  | ShowcaseToggleConfig
  | ShowcaseSidebarConfig
  | ShowcaseGlassConfig;

const tab = (
  id: ShowcaseTabConfig['id'],
  text: string,
  width: number,
  initiallySelected = false,
): ShowcaseTabConfig => ({
  id,
  kind: 'tab',
  sourceMode: 'html-css',
  text,
  initiallySelected,
  geometry: { width, height: 33, radius: 28 },
});

const control = (
  controlKey: ShowcaseControlConfig['control'],
  size: number,
  radius: number,
): ShowcaseControlConfig => ({
  id: `liquid-dom-showcase:control-${controlKey}`,
  kind: 'control-center',
  sourceMode: 'html-css',
  control: controlKey,
  geometry: { width: size, height: size, radius },
});

const sidebar = (
  item: ShowcaseSidebarConfig['item'],
  text: string,
  icon: ShowcaseSidebarConfig['icon'],
  initiallySelected = false,
): ShowcaseSidebarConfig => ({
  id: `liquid-dom-showcase:music-${item}`,
  kind: 'music-sidebar',
  sourceMode: 'html-css',
  item,
  text,
  icon,
  initiallySelected,
  geometry: { width: 238, height: 30, radius: 8 },
});

export const LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS = [
  tab(
    'liquid-dom-showcase:tab-notification',
    'Notification',
    98.484375,
    true,
  ),
  tab(
    'liquid-dom-showcase:tab-video-controls',
    'Video Controls',
    119.421875,
  ),
  tab(
    'liquid-dom-showcase:tab-music-sidebar',
    'Music Sidebar',
    115.65625,
  ),
  tab(
    'liquid-dom-showcase:tab-control-center',
    'Control Center',
    118.828125,
  ),
  tab('liquid-dom-showcase:tab-menu', 'Menu', 59.984375),
  tab(
    'liquid-dom-showcase:tab-r3f-integration',
    'R3F Integration',
    123.09375,
  ),
  tab(
    'liquid-dom-showcase:tab-notification-center',
    'Notification Center',
    145.859375,
  ),
  control('airplane', 89, 44.5),
  control('airdrop', 89, 44.5),
  control('wifi', 89, 44.5),
  control('small-grid', 89, 20),
  control('airplay', 50, 25),
  control('skip-back', 36, 18),
  control('play', 45, 22.5),
  control('skip-forward', 36, 18),
  {
    id: 'liquid-dom-showcase:ios-night-mode',
    kind: 'toggle',
    sourceMode: 'html-css',
    theme: 'ios-night-mode',
    text: 'Night mode',
    geometry: { width: 126.3125, height: 35, radius: 17.5 },
  },
  {
    id: 'liquid-dom-showcase:ios-options-action',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'ios-action',
    content: 'ios-options',
    geometry: { width: 134, height: 112, radius: 48 },
  },
  {
    id: 'liquid-dom-showcase:ios-clear-action',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'ios-action',
    content: 'ios-clear',
    geometry: { width: 134, height: 112, radius: 48 },
  },
  {
    id: 'liquid-dom-showcase:menu-dots',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'menu-dots',
    content: 'menu-dots',
    geometry: { width: 50, height: 50, radius: 25 },
  },
  {
    id: 'liquid-dom-showcase:menu-slow-mo',
    kind: 'toggle',
    sourceMode: 'html-css',
    theme: 'menu-slow-mo',
    text: 'Slow mo',
    geometry: { width: 106.3125, height: 35, radius: 17.5 },
  },
  sidebar('search', 'Search', 'Search'),
  sidebar('home', 'Home', 'House', true),
  sidebar('new', 'New', 'Grid2X2'),
  sidebar('radio', 'Radio', 'Radio'),
  sidebar('recently-added', 'Recently Added', 'Clock3'),
  sidebar('artists', 'Artists', 'MicVocal'),
  sidebar('albums', 'Albums', 'Album'),
  sidebar('songs', 'Songs', 'Music'),
  sidebar('made-for-you', 'Made for You', 'SquareUserRound'),
  sidebar('all-playlists', 'All Playlists', 'Grid3X3'),
  sidebar('favourite-songs', 'Favourite Songs', 'Star'),
  {
    id: 'liquid-dom-showcase:notification-flashlight',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'notification-center',
    content: 'notification-flashlight',
    geometry: { width: 50, height: 50, radius: 25 },
  },
  {
    id: 'liquid-dom-showcase:notification-camera',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'notification-center',
    content: 'notification-camera',
    geometry: { width: 50, height: 50, radius: 25 },
  },
  {
    id: 'liquid-dom-showcase:video-rewind-10',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'video-control',
    content: 'video-rewind-10',
    geometry: { width: 58, height: 58, radius: 29 },
  },
  {
    id: 'liquid-dom-showcase:video-forward-10',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'video-control',
    content: 'video-forward-10',
    geometry: { width: 58, height: 58, radius: 29 },
  },
  {
    id: 'liquid-dom-showcase:video-play',
    kind: 'liquid-glass',
    sourceMode: 'liquid-dom-webgpu',
    family: 'video-control',
    content: 'video-play',
    geometry: { width: 78, height: 78, radius: 39 },
  },
] as const satisfies readonly LiquidDomShowcaseButtonConfig[];

export const LIQUID_DOM_SHOWCASE_BUTTON_CONFIG_BY_ID = Object.fromEntries(
  LIQUID_DOM_SHOWCASE_BUTTON_CONFIGS.map((config) => [config.id, config]),
) as unknown as Readonly<
  Record<string, LiquidDomShowcaseButtonConfig | undefined>
>;

export const VIDEO_SKIP_PATHS = {
  back: 'M28 54.402c13.055 0 23.906-10.828 23.906-23.906c0-11.531-8.437-21.305-19.383-23.46v-3.33c0-1.664-1.148-2.11-2.437-1.195l-7.477 5.226c-1.054.75-1.078 1.875 0 2.649l7.453 5.25c1.313.937 2.461.492 2.461-1.196v-3.35c8.86 2.015 15.375 9.914 15.375 19.406A19.84 19.84 0 0 1 28 50.418c-11.063 0-19.945-8.86-19.922-19.922c.023-6.656 3.258-12.539 8.25-16.101c.961-.727 1.266-1.829.656-2.813c-.562-.96-1.851-1.219-2.883-.422C8.055 15.543 4.094 22.621 4.094 30.496c0 13.078 10.828 23.906 23.906 23.906m5.648-14.039c3.891 0 6.446-3.68 6.446-9.304c0-5.672-2.555-9.399-6.446-9.399s-6.445 3.727-6.445 9.399c0 5.625 2.555 9.304 6.445 9.304m-12.21-.281c.913 0 1.5-.633 1.5-1.617V23.723c0-1.149-.61-1.875-1.665-1.875c-.633 0-1.078.21-1.922.773l-3.257 2.18c-.516.375-.774.797-.774 1.36c0 .773.61 1.429 1.36 1.429c.445 0 .656-.094 1.125-.422l2.18-1.594v12.89c0 .962.585 1.618 1.452 1.618m12.21-2.555c-2.062 0-3.398-2.46-3.398-6.468c0-4.079 1.312-6.563 3.398-6.563c2.11 0 3.375 2.461 3.375 6.563c0 4.007-1.289 6.468-3.375 6.468',
  forward: 'M28 54.402c13.055 0 23.906-10.828 23.906-23.906c0-7.875-3.984-14.953-10.008-19.336c-1.03-.797-2.32-.539-2.906.422c-.586.984-.281 2.086.656 2.813c4.993 3.562 8.25 9.445 8.274 16.101C47.945 41.56 39.039 50.418 28 50.418c-11.063 0-19.899-8.86-19.899-19.922c0-9.492 6.516-17.39 15.376-19.406v3.375c0 1.664 1.148 2.11 2.413 1.195l7.5-5.25c1.055-.726 1.079-1.851 0-2.625l-7.476-5.25c-1.29-.937-2.437-.492-2.437 1.196v3.304C12.507 9.168 4.094 18.965 4.094 30.496c0 13.078 10.828 23.906 23.906 23.906m5.672-14.039c3.89 0 6.422-3.68 6.422-9.304c0-5.672-2.532-9.399-6.422-9.399s-6.445 3.727-6.445 9.399c0 5.625 2.554 9.304 6.445 9.304m-12.235-.281c.914 0 1.524-.633 1.524-1.617V23.723c0-1.149-.633-1.875-1.688-1.875c-.633 0-1.054.21-1.922.773l-3.234 2.18c-.539.375-.773.797-.773 1.36c0 .773.609 1.429 1.359 1.429c.422 0 .656-.094 1.125-.422l2.18-1.594v12.89c0 .962.562 1.618 1.43 1.618m12.235-2.555c-2.086 0-3.399-2.46-3.399-6.468c0-4.079 1.29-6.563 3.399-6.563c2.086 0 3.351 2.461 3.351 6.563c0 4.007-1.289 6.468-3.351 6.468',
} as const;

export function getShowcaseTechnicalInset(
  family: ShowcaseLiquidGlassFamily,
): number {
  return Math.ceil(
    Math.max(
      family.optics.bezelWidth +
        (family.optics.displacementBlur ?? 0),
      family.optics.shadowBlur +
        Math.abs(family.optics.shadowOffsetY),
    ),
  );
}
