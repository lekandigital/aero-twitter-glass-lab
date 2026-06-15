import { A2Background, A2RefTags } from '../components/approach-two/primitives';
import { A2CompositionShell } from '../components/approach-two/A2CompositionShell';
import { MaterialSpecimens } from '../components/approach-two/MaterialSpecimens';
import { ButtonBoard } from '../components/approach-two/ButtonBoard';
import { OverlayStudies } from '../components/approach-two/OverlayStudies';
import { LayerBreakdown } from '../components/approach-two/LayerBreakdown';
import { A2LayoutVariations } from '../components/approach-two/LayoutVariations';

/** Approach 2 — Reference-Labeled Liquid Aero Glass Lab */
export function ApproachTwo() {
  return (
    <div className="a2-page">
      <A2Background />

      <header className="a2-lab-header a2-glass a2-glass--rim">
        <h1>Approach 2 — Reference-Labeled Liquid Aero Glass Lab</h1>
        <p>
          Material study page for liquid Frutiger Aero glass. Every specimen is labeled with its reference
          inspiration — compare transparency, refraction, rim highlights, and nested layering before shipping.
        </p>
      </header>

      <section className="a2-section" id="full-composition">
        <h2 className="a2-section-title">Composition Study</h2>
        <p className="a2-section-desc">
          Full glass shell with left rail, center stack, right widgets, and bottom profile plate.
        </p>
        <A2RefTags refs={['tuannm93 bubbles', 'liquid-glass-bokeh-background']} className="a2-ref-tags--inline" />
        <A2CompositionShell />
      </section>

      <MaterialSpecimens />
      <ButtonBoard />
      <OverlayStudies />
      <LayerBreakdown />
      <A2LayoutVariations />
    </div>
  );
}
