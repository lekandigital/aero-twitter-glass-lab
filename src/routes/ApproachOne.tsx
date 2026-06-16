import { A1MaterialSettingsDock, A1MaterialSettingsProvider } from '../components/approach-one/materialSettings';
import { AeroBackgroundLayer } from '../components/approach-one/primitives';
import { CompositionDemo } from '../components/approach-one/CompositionDemo';
import { ComponentGallery } from '../components/approach-one/ComponentGallery';
import { LayoutVariations } from '../components/approach-one/LayoutVariations';

/** Approach 1 — Aero Component Composition Lab */
export function ApproachOne() {
  return (
    <A1MaterialSettingsProvider>
      <A1MaterialSettingsDock />
      <AeroBackgroundLayer />

      <header className="a1-lab-header">
        <h1>Approach 1 — Aero Component Composition Lab</h1>
        <p>
          Design implementation playground for Frutiger Aero glass UI. Click any glass element to inspect and edit
          its material settings in the dock.
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
    </A1MaterialSettingsProvider>
  );
}
