/** Matte + gloss overlays for frosted glass. Parent sets --sheet-frost-* CSS vars. */
export function GlassFrostSurface() {
  return (
    <>
      <span className="glass-frost-matte" aria-hidden="true" />
      <span className="glass-frost-gloss" aria-hidden="true" />
    </>
  );
}
