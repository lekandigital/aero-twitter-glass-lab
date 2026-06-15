import {
  A2FeedCard,
  A2GlassPanel,
  A2NavItem,
  A2SearchPill,
  A2SpecimenCard,
} from './primitives';

export function OverlayStudies() {
  return (
    <section className="a2-section" id="overlay-studies">
      <h2 className="a2-section-title">Glass-on-Glass Overlay Studies</h2>
      <p className="a2-section-desc">
        Layered panels proving glass remains readable and dimensional when stacked.
      </p>
      <div className="a2-specimen-grid a2-specimen-grid--overlays">
        <A2SpecimenCard title="Pill floating over big panel" refs={['liquid-glass-navbar-switcher', 'liquidGL']}>
          <A2GlassPanel variant="thick" showRefTags={false} className="a2-overlay-host">
            <p className="a2-card-text">Base glass shell</p>
            <div className="a2-overlay-float a2-overlay-float--pill">
              <A2NavItem
                active
                refs={['liquid-glass-navbar-switcher']}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l9-9 9 9" />
                  </svg>
                }
              >
                Home
              </A2NavItem>
            </div>
          </A2GlassPanel>
        </A2SpecimenCard>

        <A2SpecimenCard title="Media card inside glass card" refs={['tuannm93 liquid-glass', 'liquidGL']}>
          <A2GlassPanel variant="cyan" showRefTags={false}>
            <A2FeedCard
              title="Sample Panel"
              body="Nested media plate inside outer glass card."
              showMedia
              refs={['tuannm93 liquid-glass']}
            />
          </A2GlassPanel>
        </A2SpecimenCard>

        <A2SpecimenCard title="Widget inside larger rail" refs={['pure-css-glassmorphism-liquid-glass-ui-kit', 'liquidGL']}>
          <A2GlassPanel variant="rim" showRefTags={false} className="a2-overlay-host">
            <p className="a2-card-text a2-card-text--sm">Right rail shell</p>
            <A2GlassPanel variant="frosted" widget showRefTags={false} className="a2-overlay-nested">
              <h4 className="a2-card-title">Signal</h4>
              <p className="a2-card-text">Nested widget panel</p>
            </A2GlassPanel>
          </A2GlassPanel>
        </A2SpecimenCard>

        <A2SpecimenCard title="Profile plate overlapping sidebar" refs={['7-Aero-Stylesheet', 'liquidGL']}>
          <div className="a2-overlay-scene">
            <A2GlassPanel variant="thick" rail showRefTags={false} className="a2-overlay-sidebar">
              <p className="a2-card-text">Sidebar</p>
            </A2GlassPanel>
            <A2GlassPanel variant="footer" showRefTags={false} className="a2-overlay-profile">
              <div className="a2-profile-compact">
                <div className="a2-avatar a2-avatar--sm" />
                <div>
                  <div className="a2-profile-name">Glass User</div>
                  <div className="a2-profile-handle">System Status</div>
                </div>
              </div>
            </A2GlassPanel>
          </div>
        </A2SpecimenCard>

        <A2SpecimenCard title="Badge floating on nav item" refs={['7.css', 'liquid-glass-navbar-switcher']}>
          <A2NavItem
            active
            badge={4}
            refs={['liquid-glass-navbar-switcher', '7.css']}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              </svg>
            }
          >
            Signal
          </A2NavItem>
        </A2SpecimenCard>

        <A2SpecimenCard title="Search pill over background chrome" refs={['liquid-glass-navbar-switcher', 'tuannm93 liquid-glass']}>
          <div className="a2-overlay-chrome">
            <A2SearchPill refs={['liquid-glass-navbar-switcher', 'tuannm93 liquid-glass']} />
          </div>
        </A2SpecimenCard>
      </div>
    </section>
  );
}
