import { useReferenceWallpaper } from '../shared/useReferenceWallpaper';

export function AeroWallpaper() {
  const { referenceWallpaper } = useReferenceWallpaper();

  return (
    <div
      className={`aero-wallpaper${referenceWallpaper ? ' aero-wallpaper--compare' : ''}`}
      aria-hidden="true"
    >
      <div className="aero-wallpaper__stage">
        <img className="aero-wallpaper__image" src="/aero-bg.png" alt="" draggable={false} />
        {referenceWallpaper && (
          <img
            className="aero-wallpaper__image aero-wallpaper__image--reference"
            src="/reference.png"
            alt=""
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
