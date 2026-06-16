import { useState } from 'react';
import { a1InspectAttrs } from './inspectCatalog';
import {
  AeroButton,
  AeroComposer,
  AeroFeedCard,
  AeroIconButton,
  AeroNavPill,
  AeroPanel,
  AeroSearchPill,
  AeroShell,
  AeroWidgetCard,
} from './primitives';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3' },
  { id: 'explore', label: 'Explore', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v8m-4-4h8' },
  { id: 'messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
] as const;

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Full three-column glass composition — Approach 1 hero demo */
export function CompositionDemo() {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <AeroShell layout="balanced">
      <aside className="a1-rail">
        <AeroPanel variant="clear" rail strongRim>
          <h2 className="a1-brand">Aero Social</h2>
          <nav>
            <ul className="a1-nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <AeroNavPill
                    active={activeNav === item.id}
                    icon={<NavIcon d={item.icon} />}
                    onClick={() => setActiveNav(item.id)}
                  >
                    {item.label}
                  </AeroNavPill>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ marginTop: '1rem' }}>
            <AeroButton variant="primary" style={{ width: '100%' }}>
              Compose
            </AeroButton>
          </div>
        </AeroPanel>

        <AeroPanel variant="footer" className="a1-footer-panel">
          <div className="a1-profile-compact">
            <div className="a1-avatar a1-avatar--sm" {...a1InspectAttrs('avatar')} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Glass User</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(240,248,255,0.6)' }}>@aero.demo</div>
            </div>
          </div>
        </AeroPanel>
      </aside>

      <main className="a1-main">
        <AeroPanel variant="clear" main strongRim>
          <div className="a1-topbar">
            <AeroSearchPill className="a1-search--grow" />
            <AeroIconButton badge={3} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </AeroIconButton>
          </div>

          <div className="a1-feed">
            <AeroPanel variant="nested">
              <AeroComposer />
            </AeroPanel>

            <AeroFeedCard
              title="Glass Card"
              body="Exploring translucent feed surfaces with cyan acrylic rims and soft refraction through the sky-and-grass wallpaper."
              showMedia
            />

            <AeroFeedCard
              title="System Status"
              body="All glass layers rendering with backdrop blur, inset highlights, and blue lower shadows."
            />
          </div>
        </AeroPanel>
      </main>

      <aside className="a1-stack">
        <AeroWidgetCard title="Trending Topic">
          <div className="a1-trending-item">
            <div className="a1-trending-tag">Topic · Glass Lab</div>
            <div className="a1-trending-topic">#AeroComposition</div>
          </div>
          <div className="a1-trending-item">
            <div className="a1-trending-tag">Topic · Design</div>
            <div className="a1-trending-topic">#FrutigerAero</div>
          </div>
        </AeroWidgetCard>

        <AeroWidgetCard title="System Status">
          <p className="a1-card-text">
            <span className="a1-status-dot" />
            Panels online · blur active
          </p>
        </AeroWidgetCard>

        <AeroPanel variant="floating" widget>
          <div className="a1-media-placeholder" style={{ height: 100, borderRadius: 12 }}>
            Sample Media
          </div>
        </AeroPanel>
      </aside>
    </AeroShell>
  );
}
