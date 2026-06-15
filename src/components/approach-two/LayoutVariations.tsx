import { useState } from 'react';
import {
  A2FeedCard,
  A2GlassButton,
  A2GlassPanel,
  A2NavItem,
  A2SearchPill,
  A2Shell,
  A2SpecimenCard,
} from './primitives';

const MINI_NAV = ['Home', 'Explore', 'System'] as const;

function MiniRail({
  active,
  onSelect,
  variant = 'thick' as const,
}: {
  active: string;
  onSelect: (v: string) => void;
  variant?: 'thick' | 'rim' | 'refractive';
}) {
  return (
    <A2GlassPanel variant={variant} rail refs={['liquidGL', '7-Aero-Stylesheet']} showRefTags={false}>
      <h2 className="a2-brand a2-brand--sm">Aero Lab</h2>
      <ul className="a2-nav-list">
        {MINI_NAV.map((label) => (
          <li key={label}>
            <A2NavItem
              active={active === label}
              refs={active === label ? ['liquid-glass-navbar-switcher'] : []}
              icon={<span className="a2-nav-dot" />}
              onClick={() => onSelect(label)}
            >
              {label}
            </A2NavItem>
          </li>
        ))}
      </ul>
    </A2GlassPanel>
  );
}

export function A2LayoutVariations() {
  const [navA, setNavA] = useState('Home');
  const [navB, setNavB] = useState('Home');
  const [navC, setNavC] = useState('Home');

  return (
    <section className="a2-section" id="layout-variations">
      <h2 className="a2-section-title">Layout Variations</h2>
      <p className="a2-section-desc">
        Three shells reusing the same primitives with different transparency, border thickness, glow, and blur.
      </p>

      <A2SpecimenCard title="Variation A — Thick Vista Shell" refs={['7-Aero-Stylesheet', 'liquidGL']}>
        <div className="a2-variation a2-variation--vista">
          <A2Shell layout="vista">
            <aside className="a2-rail">
              <MiniRail active={navA} onSelect={setNavA} variant="thick" />
              <A2GlassPanel variant="footer" showRefTags={false}>
                <A2GlassButton variant="primary" refs={[]} style={{ width: '100%' }}>
                  Compose
                </A2GlassButton>
              </A2GlassPanel>
            </aside>
            <main className="a2-main">
              <A2GlassPanel variant="thick" main refract showRefTags={false}>
                <A2SearchPill />
                <div className="a2-feed">
                  <A2FeedCard title="Glass Surface" body="Thick Vista shell with heavy rims and deep shadows." showMedia />
                </div>
              </A2GlassPanel>
            </main>
            <aside className="a2-stack">
              <A2GlassPanel variant="cyan" widget showRefTags={false}>
                <div className="a2-trending-topic">Ambient Topic</div>
              </A2GlassPanel>
            </aside>
          </A2Shell>
        </div>
      </A2SpecimenCard>

      <A2SpecimenCard title="Variation B — Liquid Floating Islands" refs={['tuannm93 liquid-effect', 'liquid-glass-bokeh-background']}>
        <div className="a2-variation a2-variation--islands">
          <A2Shell layout="islands">
            <aside className="a2-rail">
              <MiniRail active={navB} onSelect={setNavB} variant="rim" />
            </aside>
            <main className="a2-main">
              <A2GlassPanel variant="floating" main showRefTags={false}>
                <A2FeedCard title="Sample Panel" body="Floating islands over sky and grass wallpaper." showMedia />
              </A2GlassPanel>
            </main>
            <aside className="a2-stack">
              <A2GlassPanel variant="bubble" widget showRefTags={false}>
                <div className="a2-trending-topic">Signal</div>
              </A2GlassPanel>
            </aside>
            <A2GlassPanel variant="footer" className="a2-footer-plate a2-footer-plate--island" showRefTags={false}>
              <p className="a2-card-text">
                <span className="a2-status-dot" />
                System Status
              </p>
            </A2GlassPanel>
          </A2Shell>
        </div>
      </A2SpecimenCard>

      <A2SpecimenCard title="Variation C — High-Transparency Acrylic" refs={['tuannm93 glass-refraction', 'pure-css-glassmorphism-liquid-glass-ui-kit']}>
        <div className="a2-variation a2-variation--acrylic">
          <A2Shell layout="acrylic">
            <aside className="a2-rail">
              <MiniRail active={navC} onSelect={setNavC} variant="refractive" />
            </aside>
            <main className="a2-main">
              <A2GlassPanel variant="refractive" main refract showRefTags={false} className="a2-glass--acrylic">
                <A2SearchPill />
                <div className="a2-feed">
                  <A2FeedCard title="Glass Surface" body="Ultra-transparent acrylic with minimal tint." />
                </div>
              </A2GlassPanel>
            </main>
            <aside className="a2-stack">
              <A2GlassPanel variant="refractive" widget refract showRefTags={false} className="a2-glass--acrylic">
                <p className="a2-card-text">High transparency widget</p>
              </A2GlassPanel>
            </aside>
          </A2Shell>
        </div>
      </A2SpecimenCard>
    </section>
  );
}
