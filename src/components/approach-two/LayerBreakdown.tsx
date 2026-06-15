import { A2RefTags } from './primitives';

const LAYERS = [
  { id: 'base', label: 'Base translucent fill', pos: 'top-left' },
  { id: 'blur', label: 'Backdrop blur / saturation', pos: 'top-right' },
  { id: 'rim', label: 'Outer white rim', pos: 'left' },
  { id: 'bevel', label: 'Inner bevel', pos: 'right' },
  { id: 'shine', label: 'Top shine streak', pos: 'top' },
  { id: 'shadow', label: 'Bottom blue shadow', pos: 'bottom' },
  { id: 'glow', label: 'Corner glow', pos: 'bottom-left' },
  { id: 'sparkle', label: 'Sparkle / glint layer', pos: 'bottom-right' },
  { id: 'filter', label: 'SVG refraction filter', pos: 'center-right' },
] as const;

export function LayerBreakdown() {
  return (
    <section className="a2-section" id="layer-breakdown">
      <h2 className="a2-section-title">Layer Breakdown</h2>
      <p className="a2-section-desc">
        Visual callout of each glass material layer stacked in a single panel specimen.
      </p>
      <div className="a2-layer-breakdown">
        <div className="a2-layer-demo a2-glass a2-glass--refractive a2-glass--filter-refract">
          <div className="a2-layer-demo-inner">
            <span className="a2-layer-demo-label">Sample Panel</span>
            <p className="a2-card-text">Multi-layer liquid glass stack</p>
          </div>
          {LAYERS.map((layer) => (
            <div key={layer.id} className={`a2-layer-callout a2-layer-callout--${layer.pos}`}>
              <span className="a2-layer-callout-line" aria-hidden="true" />
              <span className="a2-layer-callout-label">{layer.label}</span>
            </div>
          ))}
        </div>
        <div className="a2-layer-legend">
          <A2RefTags
            refs={['tuannm93 glass-refraction', 'liquidGL', 'glass-button-css-only', '7-Aero-Stylesheet']}
          />
          <p className="a2-card-text a2-layer-filter-note">
            Refraction filter inspired by: tuannm93 glass-refraction
          </p>
        </div>
      </div>
    </section>
  );
}
