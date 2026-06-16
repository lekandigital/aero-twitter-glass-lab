/** Shared material setting control — typed number / boolean / color with steppers */

import { useEffect, useRef, useState } from 'react';
import { resolveFieldHint } from './materialFieldHints';

export type MaterialDataType = 'number' | 'boolean' | 'color' | 'select';

export type MaterialSelectOption = {
  value: number;
  label: string;
};

export type MaterialFieldBase<TId extends string = string> = {
  id: TId;
  label: string;
  dataType: MaterialDataType;
  section: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  options?: MaterialSelectOption[];
};

export function materialTypeLabel(field: MaterialFieldBase): string {
  if (field.dataType === 'boolean') return 'boolean';
  if (field.dataType === 'color') return 'color';
  if (field.dataType === 'select') return 'choice';
  if (field.unit === '%') return 'percent';
  if (field.unit === 'px') return 'length';
  return 'number';
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stepNumber(field: MaterialFieldBase, current: number, direction: -1 | 1) {
  const step = field.step ?? 1;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  return clampNumber(current + direction * step, min, max);
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function stepHexColor(hex: string, direction: -1 | 1) {
  const d = direction * 6;
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(clampNumber(r + d, 0, 255), clampNumber(g + d, 0, 255), clampNumber(b + d, 0, 255));
}

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function settingValuesEqual(a: unknown, b: unknown) {
  return a === b;
}

function isValidNumberDraft(raw: string, min: number) {
  if (raw === '') return true;
  if (min < 0) return /^-?\d*\.?\d*$/.test(raw);
  return /^\d*\.?\d*$/.test(raw);
}

function formatNumberValue(value: number) {
  return String(value);
}

type MaterialNumberControlProps<TValue> = {
  field: MaterialFieldBase;
  value: number;
  onChange: (value: TValue) => void;
  classPrefix: 'a1' | 'e1' | 'e2';
};

function MaterialNumberControl<TValue>({
  field,
  value,
  onChange,
  classPrefix,
}: MaterialNumberControlProps<TValue>) {
  const p = (suffix: string) => `${classPrefix}-settings-dock__${suffix}`;
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const [draft, setDraft] = useState(() => formatNumberValue(value));
  const [editing, setEditing] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!editing) setDraft(formatNumberValue(value));
  }, [value, editing]);

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '.') {
      setDraft(formatNumberValue(value));
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      setDraft(formatNumberValue(value));
      return;
    }
    onChange(clampNumber(parsed, min, max) as TValue);
  };

  return (
    <div className="mat-setting-control mat-setting-control--number" onClick={stop}>
      <div className={p('stepper')}>
        <button
          type="button"
          className={p('step-btn')}
          aria-label={`Decrease ${field.label}`}
          disabled={value <= min}
          onClick={() => onChange(stepNumber(field, valueRef.current, -1) as TValue)}
        >
          −
        </button>
        <div className={p('field-input')}>
          <input
            type="text"
            inputMode="decimal"
            className="mat-setting-number-input"
            value={editing ? draft : formatNumberValue(value)}
            aria-label={field.label}
            onFocus={() => {
              setEditing(true);
              setDraft(formatNumberValue(value));
            }}
            onChange={(e) => {
              const next = e.target.value;
              if (isValidNumberDraft(next, min)) setDraft(next);
            }}
            onBlur={() => {
              setEditing(false);
              commitDraft();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitDraft();
                (e.currentTarget as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setDraft(formatNumberValue(value));
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
          />
          {field.unit && <span className={p('unit')}>{field.unit}</span>}
        </div>
        <button
          type="button"
          className={p('step-btn')}
          aria-label={`Increase ${field.label}`}
          disabled={value >= max}
          onClick={() => onChange(stepNumber(field, valueRef.current, 1) as TValue)}
        >
          +
        </button>
      </div>
      <input
        type="range"
        className="mat-setting-range"
        min={min}
        max={max}
        step={field.step ?? 1}
        value={value}
        aria-label={`${field.label} slider`}
        onChange={(e) => onChange(Number(e.target.value) as TValue)}
      />
    </div>
  );
}

type MaterialSettingControlProps<TValue> = {
  field: MaterialFieldBase;
  value: TValue;
  onChange: (value: TValue) => void;
  classPrefix?: 'a1' | 'e1' | 'e2';
  highlighted?: boolean;
  defaultValue?: TValue;
  onReset?: () => void;
  resetTargets?: Array<{ label: string; value: TValue }>;
  onResetTo?: (value: TValue) => void;
  fieldIndex?: number;
  outOfSync?: boolean;
};

export function MaterialSettingControl<TValue>({
  field,
  value,
  onChange,
  classPrefix = 'a1',
}: MaterialSettingControlProps<TValue>) {
  const p = (suffix: string) => `${classPrefix}-settings-dock__${suffix}`;
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  if (field.dataType === 'select') {
    const selected = value as number;
    return (
      <div className="mat-setting-control mat-setting-control--select" onClick={stop}>
        <select
          className={`mat-setting-select ${p('field-input')}`.trim()}
          value={selected}
          aria-label={field.label}
          onChange={(e) => onChange(Number(e.target.value) as TValue)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.dataType === 'boolean') {
    const checked = value as boolean;
    return (
      <div className={`mat-setting-control mat-setting-control--boolean ${p('stepper')}`.trim()} onClick={stop}>
        <button
          type="button"
          className={p('step-btn')}
          aria-label={`Set ${field.label} to false`}
          disabled={!checked}
          onClick={() => onChange(false as TValue)}
        >
          −
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={field.label}
          className={`mat-setting-switch${checked ? ' mat-setting-switch--on' : ''}`}
          onClick={() => onChange(!checked as TValue)}
        >
          <span className="mat-setting-switch__thumb" aria-hidden="true" />
          <span className="mat-setting-switch__text">{checked ? 'true' : 'false'}</span>
        </button>
        <button
          type="button"
          className={p('step-btn')}
          aria-label={`Set ${field.label} to true`}
          disabled={checked}
          onClick={() => onChange(true as TValue)}
        >
          +
        </button>
      </div>
    );
  }

  if (field.dataType === 'color') {
    const color = value as string;
    return (
      <div className={`mat-setting-control mat-setting-control--color ${p('stepper')} ${p('stepper')}--color`.trim()} onClick={stop}>
        <button type="button" className={p('step-btn')} aria-label={`Darken ${field.label}`} onClick={() => onChange(stepHexColor(color, -1) as TValue)}>−</button>
        <input
          type="color"
          className={p('color')}
          value={color}
          onChange={(e) => onChange(e.target.value as TValue)}
        />
        <input
          type="text"
          className="mat-setting-hex"
          value={color}
          spellCheck={false}
          onChange={(e) => {
            const next = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            if (isValidHex(next)) onChange(next as TValue);
          }}
        />
        <button type="button" className={p('step-btn')} aria-label={`Lighten ${field.label}`} onClick={() => onChange(stepHexColor(color, 1) as TValue)}>+</button>
      </div>
    );
  }

  const current = value as number;

  return (
    <MaterialNumberControl
      field={field}
      value={current}
      onChange={onChange}
      classPrefix={classPrefix}
    />
  );
}

export function MaterialSettingFieldRow<TValue>({
  field,
  value,
  onChange,
  classPrefix = 'a1',
  highlighted = false,
  defaultValue,
  onReset,
  resetTargets,
  onResetTo,
  fieldIndex,
  outOfSync = false,
}: MaterialSettingControlProps<TValue>) {
  const p = (suffix: string) => `${classPrefix}-settings-dock__${suffix}`;
  const typeLabel = materialTypeLabel(field);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const targets =
    resetTargets ??
    (defaultValue !== undefined && onReset ? [{ label: 'Master default', value: defaultValue }] : []);

  const applyReset = onResetTo ?? onReset;
  const canReset = targets.length > 0 && applyReset !== undefined;
  const matchesAnyTarget = targets.some((target) => settingValuesEqual(value, target.value));

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const handlePick = (targetValue: TValue) => {
    if (onResetTo) onResetTo(targetValue);
    else onReset?.();
    setMenuOpen(false);
  };

  const hint = resolveFieldHint(field);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    if (!hintVisible) return;
    const hide = () => setHintVisible(false);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [hintVisible]);

  return (
    <div
      className={`${p('field')} mat-setting-field${highlighted ? ' mat-setting-field--highlight' : ''}`}
    >
      <div className="mat-setting-field__meta">
        <div
          className="mat-setting-field__hint-anchor"
          onMouseEnter={() => hint && setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
        >
          {hint && hintVisible && (
            <div className="mat-setting-field__tooltip" role="tooltip">
              {hint}
            </div>
          )}
          <div className="mat-setting-field__label-row">
          {fieldIndex !== undefined && (
            <span className="mat-setting-field__index" aria-hidden="true">
              {fieldIndex}
            </span>
          )}
          <span className={p('field-label')}>{field.label}</span>
          {outOfSync && (
            <span className="mat-setting-field__out-of-sync" title="Layer A and Layer B differ">
              ≠
            </span>
          )}
          {canReset && (
            <div className="mat-setting-reset-wrap" ref={menuRef}>
              <button
                type="button"
                className="mat-setting-reset"
                onClick={() => {
                  if (targets.length === 1) {
                    if (!matchesAnyTarget) handlePick(targets[0].value);
                    return;
                  }
                  setMenuOpen((open) => !open);
                }}
                disabled={targets.length === 1 && matchesAnyTarget}
                aria-label={`Reset ${field.label}`}
                aria-expanded={targets.length > 1 ? menuOpen : undefined}
                aria-haspopup={targets.length > 1 ? 'menu' : undefined}
                title={
                  targets.length === 1
                    ? matchesAnyTarget
                      ? `${field.label} is at master default`
                      : `Reset ${field.label} to master default`
                    : `Reset ${field.label} — choose master default or a save`
                }
              >
                ↺
              </button>
              {menuOpen && targets.length > 1 && (
                <ul className="mat-setting-reset-menu" role="menu">
                  {targets.map((target) => (
                    <li key={target.label} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="mat-setting-reset-menu__item"
                        disabled={settingValuesEqual(value, target.value)}
                        onClick={() => handlePick(target.value)}
                      >
                        {target.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          </div>
        </div>
        <span className="mat-setting-type" title={`Data type: ${typeLabel}`}>
          {typeLabel}
        </span>
      </div>
      <MaterialSettingControl field={field} value={value} onChange={onChange} classPrefix={classPrefix} />
    </div>
  );
}
