import { useState } from 'react';
import {
  A2Badge,
  A2GlassButton,
  A2IconButton,
  A2NavItem,
  A2SearchPill,
  A2Segmented,
  A2SpecimenCard,
} from './primitives';

export function ButtonBoard() {
  const [segment, setSegment] = useState('All');
  const [navActive, setNavActive] = useState(true);

  return (
    <section className="a2-section" id="button-board">
      <h2 className="a2-section-title">Buttons, Pills, and Controls</h2>
      <p className="a2-section-desc">
        Dimensional glossy controls with top shine, inner bevel, blue gradient body, and cyan outer glow.
      </p>
      <div className="a2-specimen-grid a2-specimen-grid--controls">
        <A2SpecimenCard title="Glossy blue primary pill" refs={['glass-button-css-only', '7-Aero-Stylesheet']}>
          <A2GlassButton variant="primary" refs={['glass-button-css-only', '7-Aero-Stylesheet']}>
            Compose
          </A2GlassButton>
        </A2SpecimenCard>

        <A2SpecimenCard title="Light glass pill" refs={['tuannm93 liquid-glass', 'pure-css-glassmorphism-liquid-glass-ui-kit']}>
          <A2GlassButton variant="glass" refs={['tuannm93 liquid-glass']}>
            Glass Surface
          </A2GlassButton>
        </A2SpecimenCard>

        <A2SpecimenCard title="Active nav pill" refs={['liquid-glass-navbar-switcher']}>
          <A2NavItem
            active={navActive}
            refs={['liquid-glass-navbar-switcher', '7.css']}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l9-9 9 9" />
              </svg>
            }
            onClick={() => setNavActive((v) => !v)}
          >
            Home
          </A2NavItem>
        </A2SpecimenCard>

        <A2SpecimenCard title="Search pill" refs={['liquid-glass-navbar-switcher', 'tuannm93 liquid-glass']}>
          <A2SearchPill refs={['liquid-glass-navbar-switcher', 'tuannm93 liquid-glass']} />
        </A2SpecimenCard>

        <A2SpecimenCard title="Small circular gear button" refs={['7.css', 'glass-button-css-only']}>
          <A2IconButton refs={['7.css', 'glass-button-css-only']} aria-label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </A2IconButton>
        </A2SpecimenCard>

        <A2SpecimenCard title="Notification badge" refs={['7.css', '7-Aero-Stylesheet']}>
          <A2Badge refs={['7.css', '7-Aero-Stylesheet']}>5</A2Badge>
        </A2SpecimenCard>

        <A2SpecimenCard title="Segmented pill control" refs={['liquid-glass-navbar-switcher', '7.css']}>
          <A2Segmented
            options={['All', 'Media', 'Signal']}
            active={segment}
            onChange={setSegment}
            refs={['liquid-glass-navbar-switcher']}
          />
        </A2SpecimenCard>

        <A2SpecimenCard title="Icon-only glass button" refs={['glass-button-css-only', 'tuannm93 liquid-glass']}>
          <A2IconButton refs={['glass-button-css-only']} aria-label="Signal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            </svg>
          </A2IconButton>
        </A2SpecimenCard>
      </div>
    </section>
  );
}
