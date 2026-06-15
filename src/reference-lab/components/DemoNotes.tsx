import type { ReferenceItem } from '../types';

type DemoNotesProps = {
  item: ReferenceItem;
};

export function DemoNotes({ item }: DemoNotesProps) {
  return (
    <section className="demo-notes">
      <h3>Why this matters for Aero Twitter UI</h3>
      <p>{item.notes ?? 'General glass/Aero reference for comparison in the Reference Lab.'}</p>
      {item.candidateFor.length > 0 && (
        <ul className="demo-notes__list">
          {item.candidateFor.map((candidate) => (
            <li key={candidate}>
              <strong>{candidate}</strong>
              {' — '}
              {candidateHint(candidate)}
            </li>
          ))}
        </ul>
      )}
      {item.previewMode === 'iframe-local' && (
        <p className="demo-notes__isolation">
          This demo runs in an isolated iframe so its CSS/JS cannot clash with the main React app.
        </p>
      )}
    </section>
  );
}

function candidateHint(candidate: string): string {
  const hints: Record<string, string> = {
    'post-button': 'Compose/post control glass treatment',
    'sidebar-glass': 'Left navigation column material',
    'feed-panel': 'Central feed chrome and cards',
    'right-panel': 'Trends / who-to-follow column',
    'search-pill': 'Search bar glass pill styling',
    'active-nav-pill': 'Active tab indicator in nav',
    'gear-button': 'Settings/gear icon affordance',
    'background-bubbles': 'Wallpaper depth and motion',
    'svg-filter': 'SVG displacement/refraction filters',
    'webgl-refraction': 'GPU refraction for panels',
    'aero-windows-style': 'Vista/Frutiger Aero window chrome',
    'final-hybrid-ui': 'Priority candidate for hybrid final UI',
  };
  return hints[candidate] ?? 'Relevant UI surface';
}
