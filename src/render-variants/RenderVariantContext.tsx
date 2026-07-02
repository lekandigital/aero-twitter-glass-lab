import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RenderVariantSlug } from './manifest';
import { injectAllVariantStyles } from './injectVariantStyles';
import { VARIANT_MODULES, getRenderVariantModule } from './registry';
import type { RenderVariantModule } from './types';

type RenderVariantContextValue = {
  slug: RenderVariantSlug | null;
  module: RenderVariantModule | null;
  /** Retained for API compatibility — switching is synchronous, never pending. */
  loading: boolean;
  setVariant: (slug: RenderVariantSlug | null) => RenderVariantModule | null;
};

const RenderVariantContext = createContext<RenderVariantContextValue | null>(null);

// Inject every variant's scoped CSS as soon as this module evaluates, so the
// correct sheet is in the document before the first paint of any variant.
injectAllVariantStyles();

export function getCachedRenderVariantModule(slug: RenderVariantSlug): RenderVariantModule {
  return VARIANT_MODULES[slug];
}

export function RenderVariantProvider({
  initialSlug = null,
  children,
}: {
  initialSlug?: RenderVariantSlug | null;
  children: ReactNode;
}) {
  const [slug, setSlug] = useState<RenderVariantSlug | null>(initialSlug);
  const [module, setModule] = useState<RenderVariantModule | null>(
    initialSlug ? getRenderVariantModule(initialSlug) : null,
  );

  const setVariant = useCallback((next: RenderVariantSlug | null) => {
    if (next === null) {
      setSlug(null);
      setModule(null);
      return null;
    }
    const loaded = getRenderVariantModule(next);
    setSlug(next);
    setModule(loaded);
    return loaded;
  }, []);

  const value = useMemo(
    () => ({ slug, module, loading: false, setVariant }),
    [slug, module, setVariant],
  );

  return <RenderVariantContext.Provider value={value}>{children}</RenderVariantContext.Provider>;
}

export function useRenderVariant() {
  const ctx = useContext(RenderVariantContext);
  if (!ctx) throw new Error('useRenderVariant must be used within RenderVariantProvider');
  return ctx;
}
