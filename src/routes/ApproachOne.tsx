import { AeroBackgroundLayer } from '../components/approach-one/primitives';
import { CompositionDemo } from '../components/approach-one/CompositionDemo';
import { ComponentGallery } from '../components/approach-one/ComponentGallery';
import { LayoutVariations } from '../components/approach-one/LayoutVariations';

/** Approach 1 — Aero Component Composition Lab */
export function ApproachOne() {
  return (
    <div className="a1-lab">
      <AeroBackgroundLayer />

      <header className="a1-lab-header">
        <h1>Approach 1 — Aero Component Composition Lab</h1>
        <p>
          Design implementation playground for Frutiger Aero glass UI. Compare panels, buttons, cards,
          overlays, and layout shells before choosing what ships in the final app.
        </p>
      </header>

      <section className="a1-section" id="full-composition">
        <h2 className="a1-section-title">Full composition demo</h2>
        <p className="a1-section-desc">
          Left glass rail, central feed with composer, and right widget stack — generic Aero Social content only.
        </p>
        <CompositionDemo />
      </section>

      <ComponentGallery />
      <LayoutVariations />
    </div>
  );
}
