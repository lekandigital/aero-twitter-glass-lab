export function LayerVisibilityToggles({
  layerAVisible,
  layerBVisible,
  layerCVisible,
  layerDVisible,
  layerEVisible,
  onToggleLayerA,
  onToggleLayerB,
  onToggleLayerC,
  onToggleLayerD,
  onToggleLayerE,
  showLayerC = false,
  showLayerD = false,
  showLayerE = false,
}: {
  layerAVisible: boolean;
  layerBVisible: boolean;
  layerCVisible?: boolean;
  layerDVisible?: boolean;
  layerEVisible?: boolean;
  onToggleLayerA: () => void;
  onToggleLayerB: () => void;
  onToggleLayerC?: () => void;
  onToggleLayerD?: () => void;
  onToggleLayerE?: () => void;
  showLayerC?: boolean;
  showLayerD?: boolean;
  showLayerE?: boolean;
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
      {showLayerD && onToggleLayerD && (
        <button
          type="button"
          className={`layer-visibility-toggles__btn${layerDVisible ? ' layer-visibility-toggles__btn--active' : ' layer-visibility-toggles__btn--hidden'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLayerD();
          }}
          aria-pressed={layerDVisible ?? true}
          title={layerDVisible ? 'Hide layer D on stage' : 'Show layer D on stage'}
        >
          D
        </button>
      )}
      {showLayerE && onToggleLayerE && (
        <button
          type="button"
          className={`layer-visibility-toggles__btn${layerEVisible ? ' layer-visibility-toggles__btn--active' : ' layer-visibility-toggles__btn--hidden'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleLayerE();
          }}
          aria-pressed={layerEVisible ?? true}
          title={layerEVisible ? 'Hide layer E on stage' : 'Show layer E on stage'}
        >
          E
        </button>
      )}
    </div>
  );
}
