import type { ComponentType, CSSProperties } from 'react';
import type { E4MaterialSettings } from '../components/experiment-set-four/materialSettings';
import type { RenderVariantSlug } from './manifest';

export type RenderVariantModule = {
  ExperimentFiveDraggableLayerA: ComponentType<{
    initialPosition: { x: number; y: number };
    persistKey?: string;
    layoutResetVersion: number;
  }>;
  ExperimentFourDraggableLayerA: ComponentType<{
    initialPosition: { x: number; y: number };
    persistKey: string;
    layoutResetVersion: number;
    nestedB: boolean;
  }>;
  ExperimentFourDraggableLayerB: ComponentType<{
    initialPosition: { x: number; y: number };
    persistKey: string;
    layoutResetVersion: number;
  }>;
  refineExperimentFivePanels: (settings: E4MaterialSettings) => E4MaterialSettings;
  E5_BORDER_REFINEMENTS_VERSION: number;
  e4SettingsToCssVars: (settings: E4MaterialSettings) => CSSProperties;
  normalizeE4MaterialSettings: (settings: Partial<E4MaterialSettings>) => E4MaterialSettings;
  patchE4LayoutField: <K extends keyof E4MaterialSettings>(
    settings: E4MaterialSettings,
    id: K,
    value: E4MaterialSettings[K],
  ) => E4MaterialSettings;
  syncE4LayerBLayoutFromBezel: (settings: E4MaterialSettings) => E4MaterialSettings;
  e4FieldsVisibleForSettings: (settings: E4MaterialSettings) => ReturnType<
    typeof import('../components/experiment-set-four/materialSettings').e4FieldsVisibleForSettings
  >;
  e5LayoutPresetFromSaves?: () => Partial<E4MaterialSettings>;
};

export type RenderVariantLoaders = Record<RenderVariantSlug, () => Promise<RenderVariantModule>>;
