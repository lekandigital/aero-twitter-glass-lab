import type { ReactNode } from 'react';

type MaterialSettingCollapsibleSectionProps = {
  id: string;
  domId?: string;
  title: string;
  count: number;
  open: boolean;
  onToggle: (id: string) => void;
  titleClassName?: string;
  fieldsClassName?: string;
  children: ReactNode;
};

export function MaterialSettingCollapsibleSection({
  id,
  domId,
  title,
  count,
  open,
  onToggle,
  titleClassName = 'mat-setting-section__title',
  fieldsClassName = 'experiment-one-settings-dock__fields',
  children,
}: MaterialSettingCollapsibleSectionProps) {
  const elementId = domId ?? id;

  return (
    <section
      className={`mat-setting-section mat-setting-section--collapsible${open ? ' mat-setting-section--open' : ''}`}
      data-foldable-section={id}
      data-foldable-dom-id={elementId}
    >
      <button
        type="button"
        className="mat-setting-section__head mat-setting-section__head--toggle"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        aria-controls={`mat-section-${elementId}`}
      >
        <span className="mat-setting-section__chevron" aria-hidden="true" />
        <span className="mat-setting-section__head-text">
          <span className={titleClassName}>{title}</span>
          <span className="mat-setting-section__count">{count}</span>
        </span>
      </button>
      {open && (
        <div id={`mat-section-${elementId}`} className={`mat-setting-section__body ${fieldsClassName}`.trim()}>
          {children}
        </div>
      )}
    </section>
  );
}
