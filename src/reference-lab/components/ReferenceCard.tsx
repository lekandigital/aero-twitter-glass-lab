import type { ReferenceItem } from '../types';
import { scoreColor, scoreLabel } from '../referenceScoring';
import { Link } from 'react-router-dom';

type ReferenceCardProps = {
  item: ReferenceItem;
};

export function ReferenceCard({ item }: ReferenceCardProps) {
  return (
    <article className="ref-card">
      <Link to={`/reference-lab/${item.id}`} className="ref-card__link">
        <header className="ref-card__header">
          <h3 className="ref-card__title">{item.title}</h3>
          <span
            className="ref-card__score"
            style={{ color: scoreColor(item.usefulnessScore) }}
            title={`Usefulness: ${item.usefulnessScore}`}
          >
            {item.usefulnessScore}
            <span className="ref-card__score-label">{scoreLabel(item.usefulnessScore)}</span>
          </span>
        </header>

        <div className="ref-card__meta">
          <span className="ref-pill ref-pill--category">{item.category}</span>
          <span className="ref-pill ref-pill--runtime">{item.runtime}</span>
          {item.hasLocalDemo && (
            <span className="ref-pill ref-pill--demo">Local demo</span>
          )}
        </div>

        {item.notes && <p className="ref-card__notes">{item.notes}</p>}

        {item.tags.length > 0 && (
          <div className="ref-card__tags">
            {item.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="ref-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {item.candidateFor.length > 0 && (
          <div className="ref-card__candidates">
            <span className="ref-card__candidates-label">Candidate for:</span>
            {item.candidateFor.map((c) => (
              <span key={c} className="ref-candidate">
                {c}
              </span>
            ))}
          </div>
        )}

        {item.localSourcePath && (
          <p className="ref-card__path" title={item.localSourcePath}>
            {item.localSourcePath}
          </p>
        )}
      </Link>

      <div className="ref-card__actions">
        {item.hasLocalDemo && item.localDemoPath && (
          <a
            className="ref-btn ref-btn--primary"
            href={item.localDemoPath}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Open demo
          </a>
        )}
        {item.hasExternalUrl && item.sourceUrl && (
          <a
            className="ref-btn"
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            External
          </a>
        )}
      </div>
    </article>
  );
}
