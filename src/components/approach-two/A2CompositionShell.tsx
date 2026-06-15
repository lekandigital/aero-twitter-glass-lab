import { useState } from 'react';
import {
  A2Composer,
  A2FeedCard,
  A2GlassButton,
  A2GlassPanel,
  A2IconButton,
  A2NavItem,
  A2SearchPill,
  A2Shell,
} from './primitives';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3' },
  { id: 'explore', label: 'Explore', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v8m-4-4h8' },
  { id: 'system', label: 'System', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' },
  { id: 'samples', label: 'Samples', icon: 'M4 6h16M4 12h16M4 18h7' },
] as const;

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Full three-column glass composition with reference labels */
export function A2CompositionShell() {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <A2Shell layout="balanced">
      <aside className="a2-rail">
        <A2GlassPanel variant="thick" rail refs={['liquidGL', '7-Aero-Stylesheet']}>
          <h2 className="a2-brand">Aero Lab</h2>
          <nav>
            <ul className="a2-nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <A2NavItem
                    active={activeNav === item.id}
                    icon={<NavIcon d={item.icon} />}
                    badge={item.id === 'system' ? 2 : undefined}
                    refs={activeNav === item.id ? ['liquid-glass-navbar-switcher', '7.css'] : []}
                    onClick={() => setActiveNav(item.id)}
                  >
                    {item.label}
                  </A2NavItem>
                </li>
              ))}
            </ul>
          </nav>
          <div className="a2-rail-action">
            <A2GlassButton
              variant="primary"
              refs={['glass-button-css-only', '7-Aero-Stylesheet']}
              style={{ width: '100%' }}
            >
              Compose
            </A2GlassButton>
          </div>
        </A2GlassPanel>

        <A2GlassPanel variant="footer" className="a2-footer-plate" refs={['7-Aero-Stylesheet', 'liquidGL']}>
          <div className="a2-profile-compact">
            <div className="a2-avatar a2-avatar--sm" />
            <div>
              <div className="a2-profile-name">Glass User</div>
              <div className="a2-profile-handle">@aero.lab</div>
            </div>
          </div>
        </A2GlassPanel>
      </aside>

      <main className="a2-main">
        <A2GlassPanel variant="refractive" main refract refs={['liquidGL', 'tuannm93 glass-refraction']}>
          <div className="a2-topbar">
            <A2SearchPill
              className="a2-search--grow"
              refs={['liquid-glass-navbar-switcher', 'tuannm93 liquid-glass']}
            />
            <A2IconButton badge={3} aria-label="Notifications" refs={['7.css', 'glass-button-css-only']}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </A2IconButton>
          </div>

          <div className="a2-feed">
            <A2Composer refs={['liquidGL', 'tuannm93 glass-refraction']} />

            <A2FeedCard
              title="Glass Surface"
              body="Translucent feed panel with refractive edge borders, top sheen streak, and deep blue lower shadow letting the sky wallpaper show through."
              showMedia
              refs={['liquidGL', 'tuannm93 liquid-glass']}
            />

            <A2FeedCard
              title="System Status"
              body="All glass layers rendering with multi-stack backdrop blur, inset white rims, and cyan outer glow."
              refs={['pure-css-glassmorphism-liquid-glass-ui-kit']}
            />
          </div>
        </A2GlassPanel>
      </main>

      <aside className="a2-stack">
        <A2GlassPanel variant="cyan" widget refs={['liquidGL', 'pure-css-glassmorphism-liquid-glass-ui-kit']}>
          <h3 className="a2-card-title">Ambient Topic</h3>
          <div className="a2-trending-item">
            <div className="a2-trending-tag">Topic · Glass Lab</div>
            <div className="a2-trending-topic">#LiquidAero</div>
          </div>
          <div className="a2-trending-item">
            <div className="a2-trending-tag">Topic · Design</div>
            <div className="a2-trending-topic">#MaterialStudy</div>
          </div>
        </A2GlassPanel>

        <A2GlassPanel variant="frosted" widget refs={['liquidGL', 'pure-css-glassmorphism-liquid-glass-ui-kit']}>
          <h3 className="a2-card-title">Signal</h3>
          <p className="a2-card-text">
            <span className="a2-status-dot" />
            Panels online · refraction active
          </p>
        </A2GlassPanel>

        <A2GlassPanel variant="floating" widget refs={['tuannm93 liquid-glass', 'liquidGL']}>
          <div className="a2-media-plate a2-media-plate--compact">Media Plate</div>
        </A2GlassPanel>
      </aside>
    </A2Shell>
  );
}
