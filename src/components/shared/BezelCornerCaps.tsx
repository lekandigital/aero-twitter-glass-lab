/** Soft corner caps bridging re-entrant rim gaps into the curved border radius. */
export function BezelCornerCaps({ layerClass }: { layerClass: 'experiment-four-layer-a' | 'experiment-four-layer-b' }) {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <span
          key={corner}
          className={`${layerClass}__bezel-corner-cap ${layerClass}__bezel-corner-cap--${corner}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
