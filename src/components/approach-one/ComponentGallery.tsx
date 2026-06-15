import { useState } from 'react';
import {
  AeroBadge,
  AeroButton,
  AeroComposer,
  AeroFeedCard,
  AeroHighlight,
  AeroIconButton,
  AeroNavPill,
  AeroPanel,
  AeroSearchPill,
  AeroSegmented,
  Specimen,
} from './primitives';

/** Labeled component specimens for side-by-side comparison */
export function ComponentGallery() {
  const [segment, setSegment] = useState('All');
  const [navActive, setNavActive] = useState(true);

  return (
    <>
      {/* Panel studies */}
      <section className="a1-section" id="panel-studies">
        <h2 className="a1-section-title">Panel studies</h2>
        <p className="a1-section-desc">Large clear, frosted, tinted, nested, floating, and footer panels.</p>
        <div className="a1-gallery a1-gallery--panels">
          <Specimen label="Large clear glass panel">
            <AeroPanel variant="clear" strongRim>
              <p className="a1-card-text">Clear acrylic with white rim and blue shadow.</p>
            </AeroPanel>
          </Specimen>
          <Specimen label="Frosted blue panel">
            <AeroPanel variant="frosted-blue">
              <p className="a1-card-text">Cyan frosted treatment for widgets.</p>
            </AeroPanel>
          </Specimen>
          <Specimen label="Green-tinted grass panel">
            <AeroPanel variant="grass">
              <p className="a1-card-text">Grass-tinted glass over wallpaper.</p>
            </AeroPanel>
          </Specimen>
          <Specimen label="Nested panel">
            <AeroPanel variant="clear">
              <AeroPanel variant="nested">
                <p className="a1-card-text">Panel inside panel.</p>
              </AeroPanel>
            </AeroPanel>
          </Specimen>
          <Specimen label="Floating panel">
            <AeroPanel variant="floating">
              <p className="a1-card-text">Elevated with stronger drop shadow.</p>
            </AeroPanel>
          </Specimen>
          <Specimen label="Footer / status panel">
            <AeroPanel variant="footer">
              <p className="a1-card-text">
                <span className="a1-status-dot" />
                Status bar panel
              </p>
            </AeroPanel>
          </Specimen>
        </div>
      </section>

      {/* Button studies */}
      <section className="a1-section" id="button-studies">
        <h2 className="a1-section-title">Button studies</h2>
        <p className="a1-section-desc">Glossy pills, glass buttons, icons, nav pills, badges, segmented control.</p>
        <div className="a1-gallery a1-gallery--buttons">
          <Specimen label="Glossy blue pill button">
            <AeroButton variant="primary">Post Action</AeroButton>
          </Specimen>
          <Specimen label="Glass white pill button">
            <AeroButton variant="glass">Secondary</AeroButton>
          </Specimen>
          <Specimen label="Circular icon button">
            <AeroIconButton aria-label="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </AeroIconButton>
          </Specimen>
          <Specimen label="Active nav pill">
            <AeroNavPill
              active={navActive}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l9-9 9 9" />
                </svg>
              }
              onClick={() => setNavActive((v) => !v)}
            >
              Home
            </AeroNavPill>
          </Specimen>
          <Specimen label="Small badge">
            <AeroBadge>5</AeroBadge>
          </Specimen>
          <Specimen label="Segmented control">
            <AeroSegmented options={['All', 'Media', 'Links']} active={segment} onChange={setSegment} />
          </Specimen>
        </div>
      </section>

      {/* Card studies */}
      <section className="a1-section" id="card-studies">
        <h2 className="a1-section-title">Card &amp; nested-panel studies</h2>
        <p className="a1-section-desc">Feed, media, trending, profile, and card-inside-panel compositions.</p>
        <div className="a1-gallery a1-gallery--cards">
          <Specimen label="Feed card">
            <AeroFeedCard title="Glass Card" body="Compact feed surface with action row." />
          </Specimen>
          <Specimen label="Media card">
            <AeroFeedCard title="Sample Media" body="Card with image placeholder region." showMedia />
          </Specimen>
          <Specimen label="Trending card">
            <AeroPanel variant="frosted-blue" widget>
              <div className="a1-trending-item">
                <div className="a1-trending-tag">Trending Topic</div>
                <div className="a1-trending-topic">#AeroGlass</div>
              </div>
            </AeroPanel>
          </Specimen>
          <Specimen label="Compact profile card">
            <AeroPanel variant="clear" widget>
              <div className="a1-profile-compact">
                <div className="a1-avatar" />
                <div>
                  <div className="a1-card-title" style={{ margin: 0 }}>Glass User</div>
                  <div className="a1-card-text">@aero.demo</div>
                </div>
              </div>
            </AeroPanel>
          </Specimen>
          <Specimen label="Card inside glass panel">
            <AeroPanel variant="clear" className="a1-nested-demo">
              <p className="a1-card-text" style={{ marginBottom: '0.5rem' }}>Outer glass shell</p>
              <AeroFeedCard title="Nested Card" body="Card nested within a larger panel." />
            </AeroPanel>
          </Specimen>
        </div>
      </section>

      {/* Input studies */}
      <section className="a1-section" id="input-studies">
        <h2 className="a1-section-title">Header / search / action studies</h2>
        <p className="a1-section-desc">Search pill, composer input, filter chip.</p>
        <div className="a1-gallery a1-gallery--inputs">
          <Specimen label="Search pill">
            <AeroSearchPill />
          </Specimen>
          <Specimen label="Composer input">
            <AeroComposer />
          </Specimen>
          <Specimen label="Filter chip">
            <button type="button" className="a1-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filter: Recent
            </button>
          </Specimen>
        </div>
      </section>

      {/* Overlay studies */}
      <section className="a1-section" id="overlay-studies">
        <h2 className="a1-section-title">Overlay / refraction / highlight studies</h2>
        <p className="a1-section-desc">Rim highlights, inner borders, shadows, sparkles, bubbles, sheen.</p>
        <div className="a1-gallery a1-gallery--overlays">
          <Specimen label="Top white rim highlight">
            <div className="a1-overlay-demo">
              <AeroHighlight kind="rim-top" />
            </div>
          </Specimen>
          <Specimen label="Inner border">
            <div className="a1-overlay-demo">
              <AeroHighlight kind="inner-border" />
            </div>
          </Specimen>
          <Specimen label="Bottom blue shadow">
            <div className="a1-overlay-demo">
              <AeroHighlight kind="blue-shadow" />
            </div>
          </Specimen>
          <Specimen label="Sparkle highlight">
            <div className="a1-overlay-demo">
              <AeroHighlight kind="sparkle" />
            </div>
          </Specimen>
          <Specimen label="Bubble layer">
            <div className="a1-overlay-demo a1-overlay-demo--bubbles">
              <div className="a1-bubble-layer">
                <span className="a1-bubble" style={{ left: '20%', top: '20%', width: 36, height: 36 }} />
                <span className="a1-bubble" style={{ left: '55%', top: '40%', width: 24, height: 24 }} />
                <span className="a1-bubble" style={{ left: '70%', top: '15%', width: 44, height: 44 }} />
              </div>
            </div>
          </Specimen>
          <Specimen label="Refraction sheen layer">
            <div className="a1-overlay-demo">
              <AeroHighlight kind="sheen" />
            </div>
          </Specimen>
        </div>
      </section>
    </>
  );
}
