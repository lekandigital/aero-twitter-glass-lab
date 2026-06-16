import LiquidGlass from 'liquid-glass-react';
import {
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  Feather,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  ListTodo,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Search,
  Settings,
  Smile,
  Upload,
  User,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import '../styles/glass-showcase.css';

/* =========================================================================
   Glass Component Showcase
   Renders multiple competing visual attempts for every UI element in the
   reference screenshot, side by side, with source attribution labels.
   ========================================================================= */

/** SVG filter defs used by the distortion-based button attempt (Source 3). */
function GlassFilterDefs() {
  return (
    <svg className="gs-hidden" aria-hidden="true">
      <filter id="gs-glass-distortion" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves={1}
          seed={5}
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
          <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
          <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale={5}
          specularConstant={1}
          specularExponent={100}
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x={-200} y={-200} z={300} />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={140}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

type SectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="gs-section">
      <div className="gs-section__head">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="gs-row">{children}</div>
    </section>
  );
}

type AttemptProps = {
  label: ReactNode;
  children: ReactNode;
};

function Attempt({ label, children }: AttemptProps) {
  return (
    <div className="gs-cell">
      <div className="gs-cell__stage">{children}</div>
      <p className="gs-label">{label}</p>
    </div>
  );
}

/** Reusable interaction row used in several sections. */
function InteractionRow({ className }: { className: string }) {
  return (
    <div className={`gs-actions ${className}`}>
      <button type="button" aria-label="Reply"><MessageCircle size={18} /><span>12</span></button>
      <button type="button" aria-label="Retweet"><Repeat2 size={18} /><span>34</span></button>
      <button type="button" aria-label="Like"><Heart size={18} /><span>108</span></button>
      <button type="button" aria-label="Analytics"><BarChart3 size={18} /><span>2.1k</span></button>
      <button type="button" aria-label="Share"><Upload size={18} /></button>
    </div>
  );
}

export function GlassComponentShowcase() {
  return (
    <div className="gs-page">
      <GlassFilterDefs />

      <header className="gs-page__header">
        <h1>Glass Component Showcase</h1>
        <p>
          Competing visual attempts for every element of the Frutiger Aero glass Twitter
          reference, rendered side by side over the Aero wallpaper. Each attempt is labeled with
          the reference source it adapts so the closest match to the target can be picked.
        </p>
      </header>

      {/* 1 — PANEL BEZELS ------------------------------------------------ */}
      <Section
        title="1 · Panel Bezels — Outer Shell"
        description="Full panel rectangles mimicking the left sidebar / main feed bezel. Which molded-glass surface best matches the target?"
      >
        <Attempt label={<><strong>Attempt A</strong> — liquid-glass-switcher-css 10-layer box-shadow stack + blue tint</>}>
          <div className="gs-bezel gs-bezel--a">
            <p className="gs-bezel__eyebrow">Switcher stack</p>
            <h3 className="gs-bezel__title">Outer Bezel A</h3>
            <p className="gs-bezel__body">Multi-inset top-light / bottom-dark edges over an azure-tinted backdrop blur.</p>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — pure-css-glassmorphism-ui-kit .glass + reflection gradient</>}>
          <div className="gs-bezel gs-bezel--b">
            <p className="gs-bezel__eyebrow">UI kit glass</p>
            <h3 className="gs-bezel__title">Outer Bezel B</h3>
            <p className="gs-bezel__body">blur(18px), 1px white border, diagonal ::before reflection sweep.</p>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — 7-Aero-Stylesheet translucent frame gradient</>}>
          <div className="gs-bezel gs-bezel--c">
            <p className="gs-bezel__eyebrow">Windows Aero</p>
            <h3 className="gs-bezel__title">Outer Bezel C</h3>
            <p className="gs-bezel__body">Classic Vista azure gradient + white inset edge + blue outline.</p>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt D</strong> — switcher stack + UI-kit reflection + stronger tint (blend)</>}>
          <div className="gs-bezel gs-bezel--d">
            <p className="gs-bezel__eyebrow">Hybrid</p>
            <h3 className="gs-bezel__title">Outer Bezel D</h3>
            <p className="gs-bezel__body">Best of both: molded edges, reflection sweep, saturated azure body.</p>
          </div>
        </Attempt>
      </Section>

      {/* 2 — INNER PANELS ----------------------------------------------- */}
      <Section
        title="2 · Inner Panels — Nested Glass Cards"
        description="Cards layered inside the outer bezel (compose area / tweet cards). Recessed well vs raised card vs separator-only."
      >
        <Attempt label={<><strong>Nested set</strong> — A recessed inset well · B raised inner card · C separator-only tweet row</>}>
          <div className="gs-nest-host">
            <div className="gs-inner gs-inner--a">Attempt A — recessed inset well (compose input)</div>
            <div className="gs-inner gs-inner--b">Attempt B — raised inner glass card</div>
            <div className="gs-inner gs-inner--c">Attempt C — separator-only tweet row</div>
          </div>
        </Attempt>
      </Section>

      {/* 3 — POST BUTTON ------------------------------------------------ */}
      <Section
        title="3 · Post Button — Primary CTA"
        description="The large rounded blue Post button with feather icon. Hover and press each to compare."
      >
        <Attempt label={<><strong>Attempt A</strong> — glass-button-css-only: SVG distortion + specular layers</>}>
          <button type="button" className="gs-postbtn gs-postbtn--a">
            <span className="gs-layer1" />
            <span className="gs-layer2" />
            <Feather size={18} />
            <span className="gs-postbtn__label">Post</span>
          </button>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — light-glass-button: gradient body + rainbow caustic ::before</>}>
          <button type="button" className="gs-postbtn gs-postbtn--b">
            <Feather size={18} />
            <span className="gs-postbtn__label">Post</span>
          </button>
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — 7-Aero-Stylesheet blue gradient button</>}>
          <button type="button" className="gs-postbtn gs-postbtn--c">
            <Feather size={18} />
            <span className="gs-postbtn__label">Post</span>
          </button>
        </Attempt>
        <Attempt label={<><strong>Attempt D</strong> — liquid-glass-react wrapper around blue pill</>}>
          <LiquidGlass cornerRadius={999} padding="0" blurAmount={0.1} elasticity={0.25}>
            <button type="button" className="gs-postbtn gs-postbtn--d">
              <Feather size={18} />
              <span className="gs-postbtn__label">Post</span>
            </button>
          </LiquidGlass>
        </Attempt>
      </Section>

      {/* 4 — NAV PILLS -------------------------------------------------- */}
      <Section
        title="4 · Navigation Pills — Active State Highlight"
        description="The active-item highlight in the sidebar (Home). Each list shows the active pill treatment."
      >
        <Attempt label={<><strong>Attempt A</strong> — switcher ::after sliding pill with inset stack</>}>
          <div className="gs-navlist">
            <button type="button" className="gs-navitem gs-navitem--a is-active"><Home size={18} /><span>Home</span></button>
            <button type="button" className="gs-navitem gs-navitem--a"><Search size={18} /><span>Explore</span></button>
            <button type="button" className="gs-navitem gs-navitem--a"><Bell size={18} /><span>Notifications</span></button>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — ui-kit active glass (flat blue fill)</>}>
          <div className="gs-navlist">
            <button type="button" className="gs-navitem gs-navitem--b is-active"><Home size={18} /><span>Home</span></button>
            <button type="button" className="gs-navitem gs-navitem--b"><Search size={18} /><span>Explore</span></button>
            <button type="button" className="gs-navitem gs-navitem--b"><Bell size={18} /><span>Notifications</span></button>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — Aero blue gradient pill + molded inset</>}>
          <div className="gs-navlist">
            <button type="button" className="gs-navitem gs-navitem--c is-active"><Home size={18} /><span>Home</span></button>
            <button type="button" className="gs-navitem gs-navitem--c"><Search size={18} /><span>Explore</span></button>
            <button type="button" className="gs-navitem gs-navitem--c"><Bell size={18} /><span>Notifications</span></button>
          </div>
        </Attempt>
      </Section>

      {/* 5 — ICON BUTTONS ----------------------------------------------- */}
      <Section
        title="5 · Icon Buttons — Circular Glass Controls"
        description="Settings gear / search / toolbar icons. Vary blur depth, border, and shadow molding."
      >
        <Attempt label={<><strong>Attempt A</strong> — shallow frost + thin white border</>}>
          <button type="button" className="gs-iconbtn gs-iconbtn--a"><Settings size={20} /></button>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — molded switcher edge stack</>}>
          <button type="button" className="gs-iconbtn gs-iconbtn--b"><Settings size={20} /></button>
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — deep blur + strong rim glow</>}>
          <button type="button" className="gs-iconbtn gs-iconbtn--c"><Settings size={20} /></button>
        </Attempt>
      </Section>

      {/* 6 — SEARCH BAR ------------------------------------------------- */}
      <Section
        title="6 · Search Bar — Glass Pill Input"
        description="The top search pill. Light frost vs recessed well vs blue-tinted molded edge."
      >
        <Attempt label={<><strong>Attempt A</strong> — light frost, thin border</>}>
          <div className="gs-search gs-search--a"><Search size={16} /><input placeholder="Search" /></div>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — recessed inset well</>}>
          <div className="gs-search gs-search--b"><Search size={16} /><input placeholder="Search" /></div>
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — blue-tinted molded edge</>}>
          <div className="gs-search gs-search--c"><Search size={16} /><input placeholder="Search" /></div>
        </Attempt>
      </Section>

      {/* 7 — INTERACTION ROW -------------------------------------------- */}
      <Section
        title="7 · Tweet Interaction Buttons Row"
        description="Reply / Retweet / Like / Analytics / Share via Lucide icons. Vary hover behavior."
      >
        <Attempt label={<><strong>Attempt A</strong> — Lucide icons, blue hover tint</>}>
          <InteractionRow className="gs-actions--a" />
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — Lucide icons, pill-background hover</>}>
          <InteractionRow className="gs-actions--b" />
        </Attempt>
        <Attempt label={<><strong>Attempt C</strong> — Lucide icons, scale + pink like hover</>}>
          <InteractionRow className="gs-actions--c" />
        </Attempt>
      </Section>

      {/* 8 — NOTIFICATION BADGE ----------------------------------------- */}
      <Section
        title="8 · Notification Badge Dot"
        description="The small blue dot on the notifications bell. Static glossy vs pulsing glow."
      >
        <Attempt label={<><strong>Attempt A</strong> — static glossy dot with white ring</>}>
          <div className="gs-badge-host"><Bell size={22} /><span className="gs-dot gs-dot--a" /></div>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — pulsing glow dot</>}>
          <div className="gs-badge-host"><Bell size={22} /><span className="gs-dot gs-dot--b" /></div>
        </Attempt>
      </Section>

      {/* 9 — COMPOSE TOOLBAR -------------------------------------------- */}
      <Section
        title="9 · Compose Toolbar"
        description="Image / GIF / list / emoji / schedule / location icons + Everyone dropdown + mini Post."
      >
        <Attempt label={<><strong>Attempt A</strong> — light frosted bar</>}>
          <ComposeToolbar className="gs-toolbar--a" />
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — blue-tinted molded bar</>}>
          <ComposeToolbar className="gs-toolbar--b" />
        </Attempt>
      </Section>

      {/* 10 — SEPARATOR ------------------------------------------------- */}
      <Section
        title="10 · Tweet Card Separator"
        description="The hairline between tweet cards. Inset box-shadow line vs gradient fade divider."
      >
        <Attempt label={<><strong>Attempt A</strong> — inset box-shadow hairline (dark+light)</>}>
          <div className="gs-sep-demo">
            <p>First tweet body text…</p>
            <div className="gs-sep--a" />
            <p>Second tweet body text…</p>
          </div>
        </Attempt>
        <Attempt label={<><strong>Attempt B</strong> — gradient fade divider</>}>
          <div className="gs-sep-demo">
            <p>First tweet body text…</p>
            <div className="gs-sep--b" />
            <p>Second tweet body text…</p>
          </div>
        </Attempt>
      </Section>

      {/* 11 — FULL SIDEBAR --------------------------------------------- */}
      <Section
        title="11 · Full Sidebar Assembly"
        description="Best pieces assembled into the left sidebar: bezel + nav + active pill + Post + profile."
      >
        <Attempt label={<><strong>Assembly A</strong> — switcher bezel + Aero nav pill + distortion Post</>}>
          <Sidebar variant="a" />
        </Attempt>
        <Attempt label={<><strong>Assembly B</strong> — UI-kit bezel + flat-blue nav pill</>}>
          <Sidebar variant="b" />
        </Attempt>
      </Section>

      {/* 12 — FULL LAYOUT ---------------------------------------------- */}
      <Section
        title="12 · Full Three-Column Layout"
        description="Final composition using the strongest components: sidebar + feed + trends + top bar."
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <div className="gs-app__topbar">
            <div className="gs-search gs-search--c" style={{ width: 220 }}>
              <Search size={16} /><input placeholder="Search" />
            </div>
            <button type="button" className="gs-iconbtn gs-iconbtn--b"><Settings size={20} /></button>
          </div>
          <div className="gs-app">
            <Sidebar variant="a" />
            <div className="gs-app__center">
              <ComposeToolbar className="gs-toolbar--b" />
              {[0, 1, 2].map((i) => (
                <div className="gs-tweet" key={i}>
                  <span className="gs-avatar" />
                  <div className="gs-tweet__body">
                    <p>Frutiger Aero never died — it just went translucent. ☁️🌿 #{i + 1}</p>
                    <InteractionRow className="gs-actions--b" />
                  </div>
                  <MoreHorizontal size={18} style={{ opacity: 0.6 }} />
                </div>
              ))}
            </div>
            <div className="gs-app__right">
              <div className="gs-widget-card">
                <div className="gs-widget-card__img" />
                What's happening
              </div>
              <div className="gs-widget-card">Trending · Glassmorphism<br />48.2k posts</div>
              <div className="gs-widget-card">Trending · Windows Vista<br />12.1k posts</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" className="gs-iconbtn gs-iconbtn--a"><ChevronDown size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/** Compose toolbar (image/gif/list/emoji/schedule/location + Everyone + Post). */
function ComposeToolbar({ className }: { className: string }) {
  return (
    <div className={`gs-toolbar ${className}`}>
      <span className="gs-toolbar__icon"><ImageIcon size={18} /></span>
      <span className="gs-toolbar__icon"><ListTodo size={18} /></span>
      <span className="gs-toolbar__icon"><Smile size={18} /></span>
      <span className="gs-toolbar__icon"><Calendar size={18} /></span>
      <span className="gs-toolbar__icon"><MapPin size={18} /></span>
      <span className="gs-toolbar__spacer" />
      <span className="gs-toolbar__everyone"><Globe size={14} /> Everyone <ChevronDown size={14} /></span>
      <button type="button" className="gs-toolbar__post">Post</button>
    </div>
  );
}

/** Assembled left sidebar. */
function Sidebar({ variant }: { variant: 'a' | 'b' }) {
  const pillClass = variant === 'a' ? 'gs-navitem--c' : 'gs-navitem--b';
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Search, label: 'Explore', active: false },
    { icon: Bell, label: 'Notifications', active: false, badge: true },
    { icon: ListTodo, label: 'Lists', active: false },
    { icon: Bookmark, label: 'Bookmarks', active: false },
    { icon: Users, label: 'Communities', active: false },
    { icon: User, label: 'Profile', active: false },
    { icon: MoreHorizontal, label: 'More', active: false },
  ];
  return (
    <div className={`gs-sidebar${variant === 'b' ? ' gs-sidebar--b' : ''}`}>
      <div className="gs-sidebar__logo"><Feather size={26} /></div>
      <div className="gs-sidebar__nav">
        {navItems.map(({ icon: Icon, label, active, badge }) => (
          <button
            key={label}
            type="button"
            className={`gs-navitem ${pillClass}${active ? ' is-active' : ''}`}
            style={badge ? { position: 'relative' } : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
            {badge && <span className="gs-dot gs-dot--a" style={{ top: 6, right: 'auto', left: 22 }} />}
          </button>
        ))}
      </div>
      <button type="button" className="gs-postbtn gs-postbtn--d gs-sidebar__post">
        <Feather size={18} />
        <span className="gs-postbtn__label">Post</span>
      </button>
      <div className="gs-sidebar__profile">
        <span className="gs-avatar" />
        <div className="gs-sidebar__profile-meta">
          <b>Aero Fan</b>
          <span>@frutiger</span>
        </div>
        <MoreHorizontal size={18} />
      </div>
    </div>
  );
}
