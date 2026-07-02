const PAGE_CLASS = '.experiment-set-one-page';

/**
 * Prefix variant stylesheet rules so only the active branch pipeline applies.
 *
 * Selectors that already target `.experiment-set-one-page` get the variant
 * attribute merged onto that class (`.experiment-set-one-page[data-render-variant="slug"]…`)
 * so they still match the page element. Bare selectors (e.g. `.experiment-four-layer-a`)
 * are nested under the scoped page so they only match inside the active variant.
 */
export function scopeVariantCss(css: string, slug: string): string {
  const scopedPage = `${PAGE_CLASS}[data-render-variant="${slug}"]`;
  let result = '';
  let i = 0;

  while (i < css.length) {
    const rest = css.slice(i);

    if (rest.startsWith('/*')) {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) break;
      result += css.slice(i, end + 2);
      i = end + 2;
      continue;
    }

    if (css[i] === '@') {
      const close = findMatchingBraceClose(css, css.indexOf('{', i));
      if (close === -1) break;
      result += css.slice(i, close + 1);
      i = close + 1;
      continue;
    }

    const brace = css.indexOf('{', i);
    if (brace === -1) break;

    const selectors = css.slice(i, brace).trim();
    const close = findMatchingBraceClose(css, css.indexOf('{', i));
    if (close === -1) {
      result += css.slice(i);
      break;
    }
    const body = css.slice(brace, close + 1);

    if (selectors) {
      const scopedSelectors = selectors
        .split(',')
        .map((part) => {
          const trimmed = part.trim();
          if (!trimmed) return trimmed;
          if (trimmed.includes(PAGE_CLASS)) {
            return trimmed.replace(PAGE_CLASS, scopedPage);
          }
          return `${scopedPage} ${trimmed}`;
        })
        .join(', ');
      result += `${scopedSelectors} ${body}\n`;
    } else {
      result += body;
    }

    i = close + 1;
  }

  return result;
}

function findMatchingBraceClose(css: string, openBrace: number): number {
  let depth = 0;
  for (let i = openBrace; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}
