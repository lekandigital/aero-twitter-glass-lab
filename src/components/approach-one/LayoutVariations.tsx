import { useState } from 'react';
import {
  AeroButton,
  AeroFeedCard,
  AeroNavPill,
  AeroPanel,
  AeroSearchPill,
  AeroShell,
  AeroWidgetCard,
} from './primitives';

const MINI_NAV = ['Home', 'Explore', 'Messages'] as const;

function MiniRail({
  active,
  onSelect,
  dense,
}: {
  active: string;
  onSelect: (v: string) => void;
  dense?: boolean;
}) {
  return (
    <AeroPanel variant="clear" rail strongRim={!dense} dense={dense} light={dense}>
      <h2 className="a1-brand" style={{ fontSize: dense ? '1.1rem' : undefined }}>
        Aero Social
      </h2>
      <ul className="a1-nav-list">
        {MINI_NAV.map((label) => (
          <li key={label}>
            <AeroNavPill active={active === label} icon={<span style={{ width: 18 }} />} onClick={() => onSelect(label)}>
              {label}
            </AeroNavPill>
          </li>
        ))}
      </ul>
    </AeroPanel>
  );
}

function MiniFeed({ compact }: { compact?: boolean }) {
  return (
    <AeroPanel variant="clear" main strongRim={!compact} light={compact}>
      <AeroSearchPill />
      <div className="a1-feed" style={{ marginTop: '0.75rem' }}>
        <AeroFeedCard
          title="Glass Card"
          body={compact ? 'Lighter central panel.' : 'Balanced central feed surface.'}
          showMedia={!compact}
        />
      </div>
    </AeroPanel>
  );
}

function MiniStack({ light }: { light?: boolean }) {
  return (
    <>
      <AeroWidgetCard title="Trending Topic">
        <div className="a1-trending-topic">#AeroGlass</div>
      </AeroWidgetCard>
      {!light && (
        <AeroPanel variant="floating" widget light>
          <p className="a1-card-text">Floating widget</p>
        </AeroPanel>
      )}
    </>
  );
}

/** Three layout shells reusing the same primitives with different density */
export function LayoutVariations() {
  const [navA, setNavA] = useState('Home');
  const [navB, setNavB] = useState('Home');
  const [navC, setNavC] = useState('Home');

  return (
    <section className="a1-section" id="layout-variations">
      <h2 className="a1-section-title">Layout variations</h2>
      <p className="a1-section-desc">
        Three shells with adjusted spacing, density, transparency, and highlight intensity.
      </p>

      <div className="a1-layout-variation">
        <p className="a1-layout-label">Variation A — Balanced three-column shell</p>
        <AeroShell layout="balanced">
          <aside className="a1-rail">
            <MiniRail active={navA} onSelect={setNavA} />
          </aside>
          <main className="a1-main">
            <MiniFeed />
          </main>
          <aside className="a1-stack">
            <MiniStack />
          </aside>
        </AeroShell>
      </div>

      <div className="a1-layout-variation">
        <p className="a1-layout-label">Variation B — Heavy left glass rail, lighter right widgets</p>
        <AeroShell layout="heavy-left">
          <aside className="a1-rail">
            <MiniRail active={navB} onSelect={setNavB} />
            <AeroPanel variant="footer">
              <AeroButton variant="primary" style={{ width: '100%' }}>
                Compose
              </AeroButton>
            </AeroPanel>
          </aside>
          <main className="a1-main">
            <MiniFeed compact />
          </main>
          <aside className="a1-stack">
            <MiniStack light />
          </aside>
        </AeroShell>
      </div>

      <div className="a1-layout-variation">
        <p className="a1-layout-label">Variation C — Floating glass islands over background</p>
        <AeroShell layout="islands">
          <aside className="a1-rail">
            <MiniRail active={navC} onSelect={setNavC} dense />
          </aside>
          <main className="a1-main">
            <AeroPanel variant="floating" main strongRim>
              <AeroFeedCard title="Glass Card" body="Islands floating over sky and grass." showMedia />
            </AeroPanel>
          </main>
          <aside className="a1-stack">
            <AeroPanel variant="floating" widget>
              <div className="a1-trending-topic">Trending Topic</div>
            </AeroPanel>
          </aside>
          <AeroPanel variant="footer" className="a1-footer-panel">
            <p className="a1-card-text">
              <span className="a1-status-dot" />
              System Status
            </p>
          </AeroPanel>
        </AeroShell>
      </div>
    </section>
  );
}
