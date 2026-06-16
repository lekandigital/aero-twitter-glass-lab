import type { LayerEditMode } from './layerEditMode';

const OPTIONS: { value: LayerEditMode; label: string }[] = [
  { value: 'both', label: 'Both layers' },
  { value: 'layerA', label: 'Layer A' },
  { value: 'layerB', label: 'Layer B' },
];

export function LayerEditModeToggle({
  value,
  onChange,
}: {
  value: LayerEditMode;
  onChange: (mode: LayerEditMode) => void;
}) {
  return (
    <div className="layer-edit-mode-toggle" role="group" aria-label="Layer edit mode">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`layer-edit-mode-toggle__btn${value === option.value ? ' layer-edit-mode-toggle__btn--active' : ''}`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
