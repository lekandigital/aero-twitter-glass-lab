import { A2GlassPanel, A2SpecimenCard } from './primitives';
import type { GlassVariant } from './primitives';

type SpecimenDef = {
  title: string;
  variant: GlassVariant;
  refs: string[];
  text: string;
  refract?: boolean;
  nested?: boolean;
};

const SPECIMENS: SpecimenDef[] = [
  {
    title: 'Clear thick glass panel',
    variant: 'thick' as const,
    refs: ['liquidGL', '7-Aero-Stylesheet'],
    text: 'Heavy acrylic with double rim and deep inset shadow.',
  },
  {
    title: 'Cyan acrylic panel',
    variant: 'cyan' as const,
    refs: ['tuannm93 liquid-glass', 'pure-css-glassmorphism-liquid-glass-ui-kit'],
    text: 'Saturated cyan tint with glossy top reflection.',
  },
  {
    title: 'Frosted Aero panel',
    variant: 'frosted' as const,
    refs: ['7-Aero-Stylesheet', 'liquid-glass-bokeh-background'],
    text: 'High blur frost with soft white diffusion.',
  },
  {
    title: 'Heavy rim highlight panel',
    variant: 'rim' as const,
    refs: ['7.css', 'glass-button-css-only'],
    text: 'Bright white outer rim and inner bevel edge.',
  },
  {
    title: 'Refractive edge panel',
    variant: 'refractive' as const,
    refs: ['tuannm93 glass-refraction', 'liquidGL'],
    text: 'SVG displacement filter on edge refraction layer.',
    refract: true,
  },
  {
    title: 'Deep blue bottom-shadow panel',
    variant: 'deep-shadow' as const,
    refs: ['7-Aero-Stylesheet', 'tuannm93 liquid-effect'],
    text: 'Strong lower blue gradient shadow inside glass.',
  },
  {
    title: 'Nested glass plate',
    variant: 'nested' as const,
    refs: ['liquidGL', 'tuannm93 liquid-glass'],
    text: 'Glass-on-glass with independent rim stacks.',
    nested: true,
  },
  {
    title: 'Bubble/glint overlay panel',
    variant: 'bubble' as const,
    refs: ['tuannm93 bubbles', 'liquid-glass-bokeh-background'],
    text: 'Specular bubble highlights over translucent fill.',
  },
];

export function MaterialSpecimens() {
  return (
    <section className="a2-section" id="material-specimens">
      <h2 className="a2-section-title">Material Specimens</h2>
      <p className="a2-section-desc">
        Eight glass material treatments compared side-by-side. Each specimen uses different transparency, rim, and shadow settings.
      </p>
      <div className="a2-specimen-grid">
        {SPECIMENS.map((spec) => (
          <A2SpecimenCard key={spec.title} title={spec.title} refs={spec.refs}>
            {spec.nested ? (
              <A2GlassPanel variant="thick" showRefTags={false}>
                <A2GlassPanel variant={spec.variant} refract={spec.refract} showRefTags={false}>
                  <p className="a2-card-text">{spec.text}</p>
                </A2GlassPanel>
              </A2GlassPanel>
            ) : (
              <A2GlassPanel variant={spec.variant} refract={spec.refract} showRefTags={false}>
                <p className="a2-card-text">{spec.text}</p>
              </A2GlassPanel>
            )}
          </A2SpecimenCard>
        ))}
      </div>
    </section>
  );
}
