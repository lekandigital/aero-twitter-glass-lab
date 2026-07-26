import type { GlassGeometry, GlassProjectPreset } from './types.ts';

const SOURCE_OBJECT_IDENTITIES = {
  'liquid-dom:notification-center-main': {
    key: 'NotificationCenterDemo.mainGlass',
    component: 'NotificationCenterDemo.mainGlass',
  },
  'liquid-dom:notification-center-dock': {
    key: 'NotificationCenterDemo.bottomGlassDock',
    component: 'NotificationCenterDemo.bottomGlassDock',
  },
  'liquid-dom:ios-notification-banner': {
    key: 'IosNotificationDemo.notificationGlass',
    component: 'IosNotificationDemo.notificationGlass',
  },
  'lucas-romero:macos-dock-shell': {
    key: 'liquidGlass-wrapper.dock',
    component: 'liquidGlass-wrapper.dock',
  },
  'apple-liquid-glass:shader-shell': {
    key: 'script.js.LiquidGlass',
    component: 'LiquidGlass',
  },
  'frontend-vue:app-card': {
    key: 'AppCard.vue',
    component: 'AppCard.vue',
  },
} as const;

export type GlassProjectDataAttributes = Readonly<
  Record<`data-${string}`, string>
>;

export function getGlassProjectDataAttributes(
  preset: GlassProjectPreset,
  geometry: GlassGeometry,
  referencePresetId: string = preset.id,
): GlassProjectDataAttributes {
  const primarySource = preset.provenance.sourceFiles[0];
  const identity = SOURCE_OBJECT_IDENTITIES[preset.id];

  return {
    'data-e11-reference-object-root': referencePresetId,
    'data-reference-preset': referencePresetId,
    'data-source-object-id': preset.id,
    'data-source-preset-key': identity.key,
    'data-source-repository': preset.provenance.repository,
    'data-source-family': preset.id.slice(0, preset.id.indexOf(':')),
    'data-source-project-directory': preset.provenance.projectDirectory,
    'data-source-path': primarySource.path,
    'data-source-component': identity.component,
    'data-source-root-module': preset.provenance.sourceComponent,
    'data-source-commit': preset.provenance.repositoryCommit,
    'data-source-sha256': preset.provenance.combinedSha256,
    'data-renderer-family': preset.rendererFamily,
    'data-content-policy': 'object-only-empty',
    'data-optical-input': preset.opticalInput,
    'data-native-width': String(geometry.width),
    'data-native-height': String(geometry.height),
    'data-native-radius': String(geometry.cornerRadius),
    'data-transparent-outside': 'true',
    'data-transparent-render-surface': 'true',
    'data-source-backgrounds': 'removed',
    'data-source-content': 'removed',
    'data-internal-drag': 'disabled',
  };
}
