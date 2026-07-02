export function LayerVisibilityToggles({
  layerAVisible,
  layerBVisible,
  layerCVisible,
  onToggleLayerA,
  onToggleLayerB,
  onToggleLayerC,
  showLayerC = false,
}: {
  layerAVisible: boolean;
  layerBVisible: boolean;
  layerCVisible?: boolean;
  onToggleLayerA: () => void;
  onToggleLayerB: () => void;
  onToggleLayerC?: () => void;
  showLayerC?: boolean;
}) {
  return (
    <div className="layer-visibility-toggles" role="group" aria-label="Layer visibility">
      <button
        type="button"
        className={`layer-visibility-toggles__btn${layerAVisible ? ' layer-visibility-toggles__btn--active' : ' layer-visibility-toggles__btn--hidden'}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleLayerA();
        }}
        aria-pressed={layerAVisible}
        title={layerAVisible ? 'Hide layer A on stage' : 'Show layer A on stage'}
      >
        A
      </button>
      <button
        type="button"
        className={`layer-visibility-toggles__btn${layerBVisible ? ' layer-visibility-toggles__btn--active' : ' layer-visibility-toggles__btn--hidden'}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleLayerB();
        }}
        aria-pressed={layerBVisible}
        title={layerBVisible ? 'Hide layer B on stage' : 'Show layer B on stage'}
      >
        B
      </button>
      {showLayerC && onToggleLayerC && (
        <button
          type="button"
          className={`layer-visibility-toggles__btn${layerCVisible ? ' layer-visibility-toggles__btn--active' : ' layer-visibility-toggles__btn--hidden'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLayerC();
          }}
          aria-pressed={layerCVisible ?? true}
          title={layerCVisible ? 'Hide layer C on stage' : 'Show layer C on stage'}
        >
          C
        </button>
      )}
    </div>
  );
}
