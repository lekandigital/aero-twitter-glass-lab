import type { ReferenceItem } from '../types';
import { ReferenceCard } from './ReferenceCard';

type ReferenceGridProps = {
  items: ReferenceItem[];
};

export function ReferenceGrid({ items }: ReferenceGridProps) {
  if (items.length === 0) {
    return (
      <div className="ref-empty">
        <p>No references match your search or filters.</p>
        <p className="ref-empty__hint">Try clearing filters or broadening your search.</p>
      </div>
    );
  }

  return (
    <div className="ref-grid" role="list">
      {items.map((item) => (
        <ReferenceCard key={item.id} item={item} />
      ))}
    </div>
  );
}
