import { useState } from 'react';

export type ViewportPreset = 'fluid' | 'desktop' | 'laptop' | 'tablet' | 'mobile';

const PRESETS: Array<{ key: ViewportPreset; label: string; width?: number }> = [
  { key: 'desktop', label: 'Desktop 1440', width: 1440 },
  { key: 'laptop', label: 'Laptop 1280', width: 1280 },
  { key: 'tablet', label: 'Tablet 768', width: 768 },
  { key: 'mobile', label: 'Mobile 390', width: 390 },
  { key: 'fluid', label: 'Fluid' },
];

type DemoToolbarProps = {
  preset: ViewportPreset;
  onPresetChange: (preset: ViewportPreset) => void;
  iframeSrc: string | null;
  onBack: () => void;
  onOpenLocal?: () => void;
  onOpenExternal?: () => void;
  onCopyPath?: () => void;
  onCopyId?: () => void;
  localSourcePath?: string;
  referenceId: string;
};

export function DemoToolbar({
  preset,
  onPresetChange,
  iframeSrc,
  onBack,
  onOpenLocal,
  onOpenExternal,
  onCopyPath,
  onCopyId,
}: DemoToolbarProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(label: string, fn?: () => void) {
    fn?.();
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="demo-toolbar">
      <div className="demo-toolbar__primary">
        <button type="button" className="ref-btn" onClick={onBack}>
          ← Back to lab
        </button>
        {onOpenLocal && (
          <button type="button" className="ref-btn ref-btn--primary" onClick={onOpenLocal}>
            Open local demo
          </button>
        )}
        {onOpenExternal && (
          <button type="button" className="ref-btn" onClick={onOpenExternal}>
            Open external source
          </button>
        )}
        {onCopyPath && (
          <button
            type="button"
            className="ref-btn"
            onClick={() => handleCopy('path', onCopyPath)}
          >
            Copy source path
          </button>
        )}
        {onCopyId && (
          <button
            type="button"
            className="ref-btn"
            onClick={() => handleCopy('id', onCopyId)}
          >
            Copy reference ID
          </button>
        )}
        {copied && <span className="demo-toolbar__copied">Copied {copied}</span>}
      </div>

      {iframeSrc && (
        <div className="demo-toolbar__viewports" role="group" aria-label="Viewport size">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`ref-pill-btn${preset === key ? ' ref-pill-btn--active' : ''}`}
              onClick={() => onPresetChange(key)}
              aria-pressed={preset === key}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function getPresetWidth(preset: ViewportPreset): number | undefined {
  return PRESETS.find((p) => p.key === preset)?.width;
}
