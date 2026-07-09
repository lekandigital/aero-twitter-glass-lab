import type { LayerEditMode } from './layerEditMode';

const BASE_OPTIONS: { value: LayerEditMode; label: string; shortLabel: string }[] = [
  { value: 'both', label: 'Both layers', shortLabel: 'Both' },
  { value: 'layerA', label: 'Layer A', shortLabel: 'A' },
  { value: 'layerB', label: 'Layer B', shortLabel: 'B' },
];

const LAYER_C_OPTION = { value: 'layerC' as const, label: 'Layer C', shortLabel: 'C' };
const LAYER_D_OPTION = { value: 'layerD' as const, label: 'Layer D', shortLabel: 'D' };
const LAYER_E_OPTION = { value: 'layerE' as const, label: 'Layer E', shortLabel: 'E' };

export function LayerEditModeToggle({
  value,
  onChange,
  layout = 'horizontal',
  showLayerC = false,
  showLayerD = false,
  showLayerE = false,
}: {
  value: LayerEditMode;
  onChange: (mode: LayerEditMode) => void;
  layout?: 'horizontal' | 'side';
  showLayerC?: boolean;
  showLayerD?: boolean;
  showLayerE?: boolean;
}) {
  const isSide = layout === 'side';
  const options = [
    ...BASE_OPTIONS,
    ...(showLayerC ? [LAYER_C_OPTION] : []),
    ...(showLayerD ? [LAYER_D_OPTION] : []),
    ...(showLayerE ? [LAYER_E_OPTION] : []),
  ];

  return (
    <div
      className={`layer-edit-mode-toggle${isSide ? ' layer-edit-mode-toggle--side' : ''}`}
      role="group"
      aria-label="Layer edit mode"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`layer-edit-mode-toggle__btn${value === option.value ? ' layer-edit-mode-toggle__btn--active' : ''}`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          title={option.label}
        >
          {isSide ? option.shortLabel : option.label}
        </button>
      ))}
    </div>
  );
}
