import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { a1InspectAttrs, type A1InspectTarget } from './inspectCatalog';

/* Approach 1 — Aero Component Composition Lab primitives */

export type PanelVariant =
  | 'clear'
  | 'frosted-blue'
  | 'grass'
  | 'nested'
  | 'floating'
  | 'footer';

type AeroPanelProps = {
  variant?: PanelVariant;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  rail?: boolean;
  main?: boolean;
  widget?: boolean;
  dense?: boolean;
  light?: boolean;
  strongRim?: boolean;
};

const variantClass: Record<PanelVariant, string> = {
  clear: 'a1-panel--clear',
  'frosted-blue': 'a1-panel--frosted-blue',
  grass: 'a1-panel--grass',
  nested: 'a1-panel--nested',
  floating: 'a1-panel--floating',
  footer: 'a1-panel--footer',
};

export function AeroPanel({
  variant = 'clear',
  className = '',
  innerClassName = '',
  children,
  rail,
  main,
  widget,
  dense,
  light,
  strongRim,
}: AeroPanelProps) {
  const mods = [
    'a1-panel',
    variantClass[variant],
    rail && 'a1-panel--rail',
    main && 'a1-panel--main',
    widget && 'a1-panel--widget',
    dense && 'a1-panel--dense',
    light && 'a1-panel--light',
    strongRim && 'a1-panel--strong-rim',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={mods}
      {...a1InspectAttrs('panel', `${variant.replace('-', ' ')} panel`)}
    >
      <div className={`a1-panel-inner ${innerClassName}`.trim()}>{children}</div>
    </div>
  );
}

type HighlightKind = 'rim-top' | 'inner-border' | 'blue-shadow' | 'sparkle' | 'sheen';

const HIGHLIGHT_INSPECT: Record<HighlightKind, A1InspectTarget> = {
  'rim-top': 'highlight-rim-top',
  'inner-border': 'highlight-inner-border',
  'blue-shadow': 'highlight-blue-shadow',
  sparkle: 'highlight-sparkle',
  sheen: 'highlight-sheen',
};

export function AeroHighlight({ kind }: { kind: HighlightKind }) {
  const target = HIGHLIGHT_INSPECT[kind];
  return (
    <span
      className={`a1-highlight a1-highlight--${kind}`}
      aria-hidden="true"
      {...a1InspectAttrs(target)}
    />
  );
}

const BUBBLES = [
  { left: '8%', top: '15%', size: 48 },
  { left: '72%', top: '8%', size: 32 },
  { left: '45%', top: '65%', size: 56 },
  { left: '88%', top: '42%', size: 24 },
  { left: '22%', top: '78%', size: 36 },
  { left: '60%', top: '28%', size: 20 },
] as const;

const SPARKLES = [
  { left: '12%', top: '35%' },
  { left: '55%', top: '12%' },
  { left: '78%', top: '58%' },
  { left: '35%', top: '82%' },
  { left: '92%', top: '22%' },
] as const;

export function AeroBackgroundLayer() {
  return (
    <div className="a1-bg-layer" aria-hidden="true" {...a1InspectAttrs('background')}>
      {BUBBLES.map((b, i) => (
        <span
          key={`bubble-${i}`}
          className="a1-bubble"
          {...a1InspectAttrs('bubble', 'Background bubble')}
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      {SPARKLES.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="a1-sparkle"
          {...a1InspectAttrs('background', 'Background sparkle')}
          style={{ left: s.left, top: s.top, animationDelay: `${i * 0.6}s` }}
        />
      ))}
    </div>
  );
}

type ShellLayout = 'balanced' | 'heavy-left' | 'islands';

export function AeroShell({
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
      ? 'a1-shell--balanced'
      : layout === 'heavy-left'
        ? 'a1-shell--heavy-left'
        : 'a1-shell--islands';

  return <div className={`a1-shell ${layoutClass} ${className}`.trim()}>{children}</div>;
}

export function AeroButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'glass' }) {
  return (
    <button
      type="button"
      className={`a1-btn a1-btn--${variant} ${className}`.trim()}
      {...a1InspectAttrs(variant === 'primary' ? 'button-primary' : 'button-glass')}
      {...props}
    >
      {children}
    </button>
  );
}

export function AeroIconButton({
  children,
  badge,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number }) {
  return (
    <button
      type="button"
      className={`a1-icon-btn ${className}`.trim()}
      {...a1InspectAttrs('icon-button')}
      {...props}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="a1-badge a1-badge--on-icon">{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  );
}

export function AeroNavPill({
  active,
  icon,
  children,
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`a1-nav-pill ${active ? 'a1-nav-pill--active' : ''}`.trim()}
      {...a1InspectAttrs('nav-pill', active ? 'Active nav pill' : 'Nav pill')}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function AeroSearchPill({
  placeholder = 'Search topics…',
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <label className={`a1-search ${className}`.trim()} {...a1InspectAttrs('search')}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input type="search" placeholder={placeholder} {...props} />
    </label>
  );
}

export function AeroBadge({ children }: { children: ReactNode }) {
  return (
    <span className="a1-badge" {...a1InspectAttrs('badge')}>
      {children}
    </span>
  );
}

export function AeroComposer({
  placeholder = 'Share something with the glass network…',
}: {
  placeholder?: string;
}) {
  return (
    <div className="a1-composer" {...a1InspectAttrs('composer')}>
      <textarea className="a1-composer-input" placeholder={placeholder} rows={3} />
      <div className="a1-composer-footer">
        <AeroIconButton aria-label="Attach media">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </AeroIconButton>
        <AeroButton variant="primary">Compose</AeroButton>
      </div>
    </div>
  );
}

export function AeroFeedCard({
  title,
  body,
  showMedia = false,
}: {
  title: string;
  body: string;
  showMedia?: boolean;
}) {
  return (
    <article className="a1-card" {...a1InspectAttrs('card')}>
      {showMedia && <div className="a1-media-placeholder">Sample Media</div>}
      <div className="a1-card-body">
        <h3 className="a1-card-title">{title}</h3>
        <p className="a1-card-text" {...a1InspectAttrs('typography', 'Muted card text')}>
          {body}
        </p>
        <p className="a1-card-meta">Glass Card · 2h ago</p>
      </div>
      <div className="a1-card-actions">
        <button type="button" className="a1-card-action" aria-label="Like">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          24
        </button>
        <button type="button" className="a1-card-action" aria-label="Reply">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          8
        </button>
        <button type="button" className="a1-card-action" aria-label="Share">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export function AeroWidgetCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AeroPanel variant="frosted-blue" widget>
      <h3 className="a1-card-title">{title}</h3>
      {children}
    </AeroPanel>
  );
}

export function AeroSegmented({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="a1-segmented" role="group" {...a1InspectAttrs('segmented')}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={active === opt ? 'a1-segmented--active' : undefined}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function AeroChip({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`a1-chip ${className}`.trim()} {...a1InspectAttrs('chip')} {...props}>
      {children}
    </button>
  );
}

export function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="a1-specimen">
      <span className="a1-specimen-label">{label}</span>
      {children}
    </div>
  );
}
