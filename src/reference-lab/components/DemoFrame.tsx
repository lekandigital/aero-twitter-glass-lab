import type { ReferenceItem } from '../types';
import { scoreColor, scoreLabel } from '../referenceScoring';
import type { ViewportPreset } from './DemoToolbar';
import { getPresetWidth } from './DemoToolbar';

type DemoFrameProps = {
  item: ReferenceItem;
  iframeSrc: string | null;
  preset: ViewportPreset;
};

export function DemoFrame({ item, iframeSrc, preset }: DemoFrameProps) {
  const width = getPresetWidth(preset);

  if (!iframeSrc) {
    return (
      <div className="demo-frame demo-frame--empty">
        <div className="demo-frame__placeholder">
          <h3>Preview not available in iframe</h3>
          <p>
            This reference is <strong>{item.previewMode}</strong>. External hosts like
            GitHub, Reddit, YouTube, and search pages are opened as links to avoid
            broken embeds and framework conflicts.
          </p>
          {item.sourceUrl && (
            <a className="ref-btn ref-btn--primary" href={item.sourceUrl} target="_blank" rel="noreferrer">
              Open external source
            </a>
          )}
          {item.localDemoPath && (
            <a className="ref-btn" href={item.localDemoPath} target="_blank" rel="noreferrer">
              Open local demo file
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`demo-frame${preset === 'fluid' ? ' demo-frame--fluid' : ''}`}>
      <div
        className="demo-frame__chrome"
        style={width ? { maxWidth: width, margin: '0 auto' } : undefined}
      >
        <div className="demo-frame__rim" />
        <iframe
          title={`Preview: ${item.title}`}
          src={iframeSrc}
          className="demo-frame__iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

type DemoMetaPanelProps = {
  item: ReferenceItem;
};

export function DemoMetaPanel({ item }: DemoMetaPanelProps) {
  return (
    <aside className="demo-meta">
      <h2 className="demo-meta__title">{item.title}</h2>
      <dl className="demo-meta__grid">
        <div>
          <dt>Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{item.runtime}</dd>
        </div>
        <div>
          <dt>Preview mode</dt>
          <dd>{item.previewMode}</dd>
        </div>
        <div>
          <dt>Usefulness</dt>
          <dd style={{ color: scoreColor(item.usefulnessScore) }}>
            {item.usefulnessScore} — {scoreLabel(item.usefulnessScore)}
          </dd>
        </div>
        {item.localSourcePath && (
          <div className="demo-meta__full">
            <dt>Vault path</dt>
            <dd>{item.localSourcePath}</dd>
          </div>
        )}
        {item.sourceUrl && (
          <div className="demo-meta__full">
            <dt>Source URL</dt>
            <dd>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                {item.sourceUrl}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {item.tags.length > 0 && (
        <div className="demo-meta__tags">
          {item.tags.map((tag) => (
            <span key={tag} className="ref-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {item.candidateFor.length > 0 && (
        <div className="demo-meta__candidates">
          <h3>UI candidates</h3>
          <div className="ref-card__candidates">
            {item.candidateFor.map((c) => (
              <span key={c} className="ref-candidate">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
