import type { ReferenceFilterKey, ReferenceSortKey } from '../types';

const FILTERS: Array<{ key: ReferenceFilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'local-demos', label: 'Local demos' },
  { key: 'codepen', label: 'CodePen' },
  { key: 'github', label: 'GitHub' },
  { key: 'webgl', label: 'WebGL' },
  { key: 'css-svg', label: 'CSS/SVG' },
  { key: 'react', label: 'React' },
  { key: 'vue', label: 'Vue' },
  { key: 'articles', label: 'Articles' },
  { key: 'final-candidates', label: 'Final candidates' },
];

const SORTS: Array<{ key: ReferenceSortKey; label: string }> = [
  { key: 'usefulness', label: 'Usefulness score' },
  { key: 'category', label: 'Category' },
  { key: 'title', label: 'Title' },
  { key: 'runtime', label: 'Runtime' },
];

type ReferenceFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filter: ReferenceFilterKey;
  onFilterChange: (value: ReferenceFilterKey) => void;
  sortKey: ReferenceSortKey;
  onSortChange: (value: ReferenceSortKey) => void;
};

export function ReferenceFilters({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sortKey,
  onSortChange,
}: ReferenceFiltersProps) {
  return (
    <div className="ref-filters">
      <div className="ref-search-wrap">
        <input
          type="search"
          className="ref-search"
          placeholder="Search references by title, tag, runtime, path…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search references"
        />
      </div>

      <div className="ref-filter-pills" role="group" aria-label="Filter references">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`ref-pill-btn${filter === key ? ' ref-pill-btn--active' : ''}`}
            onClick={() => onFilterChange(key)}
            aria-pressed={filter === key}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ref-sort-row">
        <label className="ref-sort-label" htmlFor="ref-sort">
          Sort by
        </label>
        <select
          id="ref-sort"
          className="ref-sort-select"
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as ReferenceSortKey)}
        >
          {SORTS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
