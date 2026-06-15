import type {
  ReferenceFilterKey,
  ReferenceItem,
  ReferenceSortKey,
} from './types';

export function getReferenceById(
  items: ReferenceItem[],
  id: string,
): ReferenceItem | undefined {
  return items.find((item) => item.id === id);
}

export function filterReferences(
  items: ReferenceItem[],
  query: string,
  filter: ReferenceFilterKey,
): ReferenceItem[] {
  const q = query.trim().toLowerCase();

  return items.filter((item) => {
    if (!matchesFilter(item, filter)) return false;
    if (!q) return true;

    const haystack = [
      item.title,
      item.category,
      item.runtime,
      item.notes ?? '',
      item.localSourcePath ?? '',
      item.sourceUrl ?? '',
      ...item.tags,
      ...item.candidateFor,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

function matchesFilter(item: ReferenceItem, filter: ReferenceFilterKey): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'local-demos':
      return item.hasLocalDemo;
    case 'codepen':
      return (
        item.category === 'CodePen pages' ||
        item.category === 'Local CodePen exports'
      );
    case 'github':
      return (
        item.category === 'GitHub pages' ||
        item.category === 'Local GitHub static demos'
      );
    case 'webgl':
      return ['webgl', 'three', 'shader'].includes(item.runtime);
    case 'css-svg':
      return ['css-only', 'svg-filter'].includes(item.runtime);
    case 'react':
      return item.runtime === 'react';
    case 'vue':
      return item.runtime === 'vue';
    case 'articles':
      return (
        item.runtime === 'article' ||
        item.category === 'Articles/news/design reactions' ||
        item.category === 'Wikipedia/design history' ||
        item.category === 'Reddit discussions'
      );
    case 'final-candidates':
      return (
        item.category === 'Final UI candidates' ||
        item.candidateFor.includes('final-hybrid-ui')
      );
    default:
      return true;
  }
}

export function sortReferences(
  items: ReferenceItem[],
  sortKey: ReferenceSortKey,
): ReferenceItem[] {
  const sorted = [...items];
  switch (sortKey) {
    case 'usefulness':
      return sorted.sort(
        (a, b) =>
          b.usefulnessScore - a.usefulnessScore ||
          a.title.localeCompare(b.title),
      );
    case 'category':
      return sorted.sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          b.usefulnessScore - a.usefulnessScore,
      );
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'runtime':
      return sorted.sort(
        (a, b) =>
          a.runtime.localeCompare(b.runtime) ||
          b.usefulnessScore - a.usefulnessScore,
      );
    default:
      return sorted;
  }
}

export function computeLabStats(items: ReferenceItem[]) {
  return {
    total: items.length,
    localDemos: items.filter((i) => i.hasLocalDemo).length,
    externalOnly: items.filter((i) => !i.hasLocalDemo && i.hasExternalUrl).length,
    finalCandidates: items.filter(
      (i) =>
        i.category === 'Final UI candidates' ||
        i.candidateFor.includes('final-hybrid-ui'),
    ).length,
    linkOnly: items.filter((i) => i.previewMode === 'link-only').length,
  };
}

export const SAFE_EXTERNAL_IFRAME_HOSTS = [
  'liquidgl.naughtyduk.com',
  'liquid-glass-eta.vercel.app',
  'kvideo.pages.dev',
  'css.glass',
  'kube.io',
  'freefrontend.com',
] as const;

export function getIframeSrc(item: ReferenceItem): string | null {
  if (item.previewMode === 'iframe-local' && item.localDemoPath) {
    return item.localDemoPath;
  }
  if (item.previewMode === 'iframe-external' && item.sourceUrl) {
    return item.sourceUrl;
  }
  return null;
}
