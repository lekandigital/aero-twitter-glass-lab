import { useMemo, useState } from 'react';
import { referenceIndex } from '../reference-lab/generated/referenceIndex';
import { ReferenceFilters } from '../reference-lab/components/ReferenceFilters';
import { ReferenceGrid } from '../reference-lab/components/ReferenceGrid';
import type { ReferenceFilterKey, ReferenceSortKey } from '../reference-lab/types';
import {
  computeLabStats,
  filterReferences,
  sortReferences,
} from '../reference-lab/referenceUtils';

export function ReferenceLab() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ReferenceFilterKey>('all');
  const [sortKey, setSortKey] = useState<ReferenceSortKey>('usefulness');

  const stats = useMemo(() => computeLabStats(referenceIndex), []);

  const visibleItems = useMemo(() => {
    const filtered = filterReferences(referenceIndex, query, filter);
    return sortReferences(filtered, sortKey);
  }, [query, filter, sortKey]);

  return (
    <div className="ref-lab">
      <header className="ref-lab__header">
        <h1>Aero Glass Reference Lab</h1>
        <p className="ref-lab__sub">
          Browse, group, and test saved glass, Aero, and Liquid Glass references from one place.
          Runnable demos are isolated in iframes so clashing frameworks never break the main app.
        </p>
      </header>

      <div className="ref-stats">
        <div className="ref-stat">
          <span className="ref-stat__value">{stats.total}</span>
          <span className="ref-stat__label">Total references</span>
        </div>
        <div className="ref-stat">
          <span className="ref-stat__value">{stats.localDemos}</span>
          <span className="ref-stat__label">Local iframe demos</span>
        </div>
        <div className="ref-stat">
          <span className="ref-stat__value">{stats.externalOnly}</span>
          <span className="ref-stat__label">External-only</span>
        </div>
        <div className="ref-stat">
          <span className="ref-stat__value">{stats.finalCandidates}</span>
          <span className="ref-stat__label">Final UI candidates</span>
        </div>
      </div>

      <ReferenceFilters
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        sortKey={sortKey}
        onSortChange={setSortKey}
      />

      <p className="ref-lab__count" aria-live="polite">
        Showing {visibleItems.length} of {stats.total} references
      </p>

      <ReferenceGrid items={visibleItems} />
    </div>
  );
}
