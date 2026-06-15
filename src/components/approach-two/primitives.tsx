import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/* Approach 2 — Reference-Labeled Liquid Aero Glass Lab primitives */

export type GlassVariant =
  | 'default'
  | 'thick'
  | 'cyan'
  | 'frosted'
  | 'rim'
  | 'refractive'
  | 'deep-shadow'
  | 'nested'
  | 'bubble'
  | 'footer'
  | 'floating';

const variantClass: Record<GlassVariant, string> = {
  default: '',
  thick: 'a2-glass--thick',
  cyan: 'a2-glass--cyan',
  frosted: 'a2-glass--frosted',
  rim: 'a2-glass--rim',
  refractive: 'a2-glass--refractive',
  'deep-shadow': 'a2-glass--deep-shadow',
  nested: 'a2-glass--nested',
  bubble: 'a2-glass--bubble',
  footer: 'a2-glass--footer',
  floating: 'a2-glass--floating',
};

/* ── Reference tags ── */

export function A2RefTag({ children }: { children: ReactNode }) {
  return <span className="a2-ref-tag">{children}</span>;
}

export function A2RefTags({ refs, className = '' }: { refs: string[]; className?: string }) {
  return (
    <div className={`a2-ref-tags ${className}`.trim()} aria-label="Design references">
      {refs.map((ref) => (
        <A2RefTag key={ref}>{ref}</A2RefTag>
      ))}
    </div>
  );
}

/* ── SVG refraction filter (tuannm93 glass-refraction inspired) ── */

export function A2RefractionFilterDefs() {
  return (
    <svg className="a2-svg-filters" aria-hidden="true">
      <defs>
        <filter id="a2-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="a2-glass-glint" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4"
            specularConstant="1.2"
            specularExponent="28"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="-40" y="-60" z="120" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.65" k4="0" />
        </filter>
      </defs>
    </svg>
  );
}

/* ── Background ── */

const BUBBLES = [
  { left: '6%', top: '12%', size: 72 },
  { left: '78%', top: '6%', size: 48 },
  { left: '42%', top: '58%', size: 88 },
  { left: '90%', top: '38%', size: 36 },
  { left: '18%', top: '72%', size: 56 },
  { left: '62%', top: '22%', size: 28 },
  { left: '32%', top: '35%', size: 40 },
  { left: '85%', top: '78%', size: 52 },
] as const;

const GLINTS = [
  { left: '10%', top: '28%' },
  { left: '52%', top: '8%' },
  { left: '74%', top: '52%' },
  { left: '28%', top: '85%' },
  { left: '94%', top: '18%' },
  { left: '48%', top: '68%' },
] as const;

export function A2Background() {
  return (
    <div className="a2-bg" aria-hidden="true">
      <A2RefractionFilterDefs />
      {BUBBLES.map((b, i) => (
        <span
          key={`bubble-${i}`}
          className="a2-bubble"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
      {GLINTS.map((g, i) => (
        <span
          key={`glint-${i}`}
          className="a2-glint"
          style={{ left: g.left, top: g.top, animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </div>
  );
}

/* ── Glass panel ── */

type A2GlassPanelProps = {
  variant?: GlassVariant;
  refs?: string[];
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  rail?: boolean;
  main?: boolean;
  widget?: boolean;
  refract?: boolean;
  showRefTags?: boolean;
};

export function A2GlassPanel({
  variant = 'default',
  refs = [],
  className = '',
  innerClassName = '',
  children,
  rail,
  main,
  widget,
  refract,
  showRefTags = true,
}: A2GlassPanelProps) {
  const mods = [
    'a2-glass',
    variantClass[variant],
    rail && 'a2-glass--rail',
    main && 'a2-glass--main',
    widget && 'a2-glass--widget',
    refract && 'a2-glass--filter-refract',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={mods} data-ref={refs.join(', ') || undefined}>
      {showRefTags && refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--panel" />}
      <div className={`a2-glass-inner ${innerClassName}`.trim()}>{children}</div>
    </div>
  );
}

/* ── Buttons ── */

export function A2GlassButton({
  variant = 'primary',
  refs = [],
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'glass';
  refs?: string[];
}) {
  return (
    <div className="a2-button-wrap">
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--inline" />}
      <button
        type="button"
        className={`a2-button a2-button--${variant} ${className}`.trim()}
        data-ref={refs.join(', ') || undefined}
        {...props}
      >
        <span className="a2-button-shine" aria-hidden="true" />
        {children}
      </button>
    </div>
  );
}

export function A2IconButton({
  children,
  badge,
  refs = [],
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number; refs?: string[] }) {
  return (
    <div className="a2-button-wrap a2-button-wrap--icon">
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--inline" />}
      <button
        type="button"
        className={`a2-icon-button ${className}`.trim()}
        data-ref={refs.join(', ') || undefined}
        {...props}
      >
        <span className="a2-button-shine" aria-hidden="true" />
        {children}
        {badge != null && badge > 0 && (
          <span className="a2-badge a2-badge--on-icon">{badge > 9 ? '9+' : badge}</span>
        )}
      </button>
    </div>
  );
}

export function A2NavItem({
  active,
  icon,
  children,
  badge,
  refs = [],
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  children: ReactNode;
  badge?: number;
  refs?: string[];
  onClick?: () => void;
}) {
  return (
    <div className="a2-nav-wrap">
      <button
        type="button"
        className={`a2-pill a2-pill--nav ${active ? 'a2-pill--nav-active' : ''}`.trim()}
        data-ref={refs.join(', ') || undefined}
        onClick={onClick}
      >
        <span className="a2-button-shine" aria-hidden="true" />
        {icon}
        <span>{children}</span>
        {badge != null && badge > 0 && <span className="a2-badge a2-badge--nav">{badge}</span>}
      </button>
      {refs.length > 0 && active && <A2RefTags refs={refs} className="a2-ref-tags--nav" />}
    </div>
  );
}

export function A2SearchPill({
  placeholder = 'Search samples…',
  refs = [],
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { refs?: string[]; className?: string }) {
  return (
    <div className={`a2-search-wrap ${className}`.trim()}>
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--inline" />}
      <label className="a2-pill a2-pill--search" data-ref={refs.join(', ') || undefined}>
        <span className="a2-button-shine" aria-hidden="true" />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input type="search" placeholder={placeholder} {...props} />
      </label>
    </div>
  );
}

export function A2Badge({
  children,
  refs = [],
}: {
  children: ReactNode;
  refs?: string[];
}) {
  return (
    <div className="a2-badge-wrap">
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--inline" />}
      <span className="a2-badge" data-ref={refs.join(', ') || undefined}>
        {children}
      </span>
    </div>
  );
}

export function A2Segmented({
  options,
  active,
  onChange,
  refs = [],
}: {
  options: string[];
  active: string;
  onChange: (value: string) => void;
  refs?: string[];
}) {
  return (
    <div className="a2-segmented-wrap">
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--inline" />}
      <div className="a2-segmented" role="group" data-ref={refs.join(', ') || undefined}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={active === opt ? 'a2-segmented--active' : undefined}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Specimen card ── */

export function A2SpecimenCard({
  title,
  refs = [],
  children,
}: {
  title: string;
  refs?: string[];
  children: ReactNode;
}) {
  return (
    <div className="a2-specimen">
      <div className="a2-specimen-header">
        <span className="a2-specimen-title">{title}</span>
        {refs.length > 0 && <A2RefTags refs={refs} />}
      </div>
      {children}
    </div>
  );
}

/* ── Shell layout ── */

type ShellLayout = 'balanced' | 'vista' | 'islands' | 'acrylic';

export function A2Shell({
  layout,
  className = '',
  children,
}: {
  layout: ShellLayout;
  className?: string;
  children: ReactNode;
}) {
  const layoutClass =
    layout === 'balanced'
      ? 'a2-composition--balanced'
      : layout === 'vista'
        ? 'a2-composition--vista'
        : layout === 'islands'
          ? 'a2-composition--islands'
          : 'a2-composition--acrylic';

  return <div className={`a2-composition ${layoutClass} ${className}`.trim()}>{children}</div>;
}

/* ── Composer / feed helpers ── */

export function A2Composer({ refs = [] }: { refs?: string[] }) {
  return (
    <A2GlassPanel variant="nested" refs={refs}>
      <div className="a2-composer">
        <textarea className="a2-composer-input" placeholder="Compose on glass surface…" rows={3} />
        <div className="a2-composer-footer">
          <A2IconButton aria-label="Attach media">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </A2IconButton>
          <A2GlassButton variant="primary" refs={['glass-button-css-only', '7-Aero-Stylesheet']}>
            Compose
          </A2GlassButton>
        </div>
      </div>
    </A2GlassPanel>
  );
}

export function A2FeedCard({
  title,
  body,
  showMedia = false,
  refs = [],
}: {
  title: string;
  body: string;
  showMedia?: boolean;
  refs?: string[];
}) {
  return (
    <article className="a2-card" data-ref={refs.join(', ') || undefined}>
      {refs.length > 0 && <A2RefTags refs={refs} className="a2-ref-tags--card" />}
      {showMedia && <div className="a2-media-plate">Media Plate</div>}
      <div className="a2-card-body">
        <h3 className="a2-card-title">{title}</h3>
        <p className="a2-card-text">{body}</p>
        <p className="a2-card-meta">Glass Surface · 2h ago</p>
      </div>
    </article>
  );
}
