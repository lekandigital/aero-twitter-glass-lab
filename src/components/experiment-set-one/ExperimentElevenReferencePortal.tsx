import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

type MeasuredImage = {
  key: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: string;
  objectFit: CSSProperties['objectFit'];
  objectPosition: CSSProperties['objectPosition'];
  zIndex: string;
};

export type ExperimentElevenReferencePortalGeometry = {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  viewportWidth: number;
  viewportHeight: number;
  wallpaperImages: MeasuredImage[];
};

function imageKey(image: HTMLImageElement, index: number): string {
  return `${index}:${image.currentSrc || image.src}`;
}

function sameGeometry(
  previous: ExperimentElevenReferencePortalGeometry | null,
  next: ExperimentElevenReferencePortalGeometry,
): boolean {
  if (!previous) return false;
  if (
    previous.left !== next.left ||
    previous.top !== next.top ||
    previous.scaleX !== next.scaleX ||
    previous.scaleY !== next.scaleY ||
    previous.viewportWidth !== next.viewportWidth ||
    previous.viewportHeight !== next.viewportHeight ||
    previous.wallpaperImages.length !== next.wallpaperImages.length
  ) {
    return false;
  }
  return previous.wallpaperImages.every((image, index) => {
    const candidate = next.wallpaperImages[index];
    return (
      image.key === candidate.key &&
      image.left === candidate.left &&
      image.top === candidate.top &&
      image.width === candidate.width &&
      image.height === candidate.height &&
      image.opacity === candidate.opacity &&
      image.objectFit === candidate.objectFit &&
      image.objectPosition === candidate.objectPosition &&
      image.zIndex === candidate.zIndex
    );
  });
}

/**
 * Tracks the real Layer C drag anchor and the actual Aero wallpaper pixels.
 *
 * The live Save 249 Layer B remains fully opaque and untouched. Reference
 * renderers instead sample these cloned source images inside their own tightly
 * clipped page-level stacking context. Moving the drag anchor changes which
 * part of the same wallpaper is behind the glass without punching a hole in B.
 */
export function useExperimentElevenReferencePortalGeometry(
  anchorRef: RefObject<HTMLElement | null>,
  nativeWidth: number,
  nativeHeight: number,
): ExperimentElevenReferencePortalGeometry | null {
  const [geometry, setGeometry] = useState<ExperimentElevenReferencePortalGeometry | null>(null);

  useLayoutEffect(() => {
    let frame = 0;
    let disposed = false;

    const measure = () => {
      if (disposed) return;
      const anchor = anchorRef.current;
      if (anchor) {
        const anchorRect = anchor.getBoundingClientRect();
        const wallpaperImages = Array.from(
          document.querySelectorAll<HTMLImageElement>('.aero-wallpaper__image'),
        ).flatMap((image, index) => {
          const src = image.currentSrc || image.src;
          if (!src) return [];
          const rect = image.getBoundingClientRect();
          const style = getComputedStyle(image);
          return [{
            key: imageKey(image, index),
            src,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            opacity: style.opacity,
            objectFit: style.objectFit as CSSProperties['objectFit'],
            objectPosition: style.objectPosition,
            zIndex: style.zIndex,
          }];
        });
        const next: ExperimentElevenReferencePortalGeometry = {
          left: anchorRect.left,
          top: anchorRect.top,
          scaleX: anchorRect.width / nativeWidth,
          scaleY: anchorRect.height / nativeHeight,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          wallpaperImages,
        };
        setGeometry((previous) => (sameGeometry(previous, next) ? previous : next));
      }
      frame = requestAnimationFrame(measure);
    };

    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
    };
  }, [anchorRef, nativeHeight, nativeWidth]);

  return geometry;
}

export function ExperimentElevenWallpaperClone({
  geometry,
  nativeWidth,
  nativeHeight,
}: {
  geometry: ExperimentElevenReferencePortalGeometry;
  nativeWidth: number;
  nativeHeight: number;
}) {
  const scaleX = geometry.scaleX || 1;
  const scaleY = geometry.scaleY || 1;
  return (
    <div
      className="experiment-eleven-reference-backdrop"
      data-e11-reference-backdrop="aero-wallpaper-clone"
      aria-hidden="true"
      style={{
        width: nativeWidth,
        height: nativeHeight,
        background: '#0a1628',
      }}
    >
      {geometry.wallpaperImages.map((image) => (
        <img
          key={image.key}
          src={image.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: (image.left - geometry.left) / scaleX,
            top: (image.top - geometry.top) / scaleY,
            width: image.width / scaleX,
            height: image.height / scaleY,
            maxWidth: 'none',
            maxHeight: 'none',
            opacity: image.opacity,
            objectFit: image.objectFit,
            objectPosition: image.objectPosition,
            zIndex: image.zIndex === 'auto' ? undefined : Number(image.zIndex),
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  );
}

export function ExperimentElevenReferencePortal({
  anchorRef,
  presetId,
  sourceFamily,
  rendererType,
  nativeWidth,
  nativeHeight,
  nativeRadius,
  renderWidth = nativeWidth,
  renderHeight = nativeHeight,
  renderOffsetX = 0,
  renderOffsetY = 0,
  renderRadius = nativeRadius,
  cloneWallpaper = true,
  interactive = false,
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  presetId: string;
  sourceFamily: string;
  rendererType: string;
  nativeWidth: number;
  nativeHeight: number;
  nativeRadius: number;
  /**
   * Optional source-composition box around the native glass. The draggable
   * anchor keeps the glass's exact native geometry; these values only restore
   * a larger source demo bed when the renderer measures/refraction-samples it.
   */
  renderWidth?: number;
  renderHeight?: number;
  renderOffsetX?: number;
  renderOffsetY?: number;
  renderRadius?: number;
  cloneWallpaper?: boolean;
  interactive?: boolean;
  children: ReactNode;
}) {
  const geometry = useExperimentElevenReferencePortalGeometry(
    anchorRef,
    nativeWidth,
    nativeHeight,
  );

  if (typeof document === 'undefined' || !geometry) return null;

  const hostLeft = geometry.left - renderOffsetX * geometry.scaleX;
  const hostTop = geometry.top - renderOffsetY * geometry.scaleY;
  const hostGeometry = {
    ...geometry,
    left: hostLeft,
    top: hostTop,
  };

  return createPortal(
    <div
      className="experiment-eleven-reference-overlay"
      data-e11-reference-overlay=""
      data-e11-reference-preset={presetId}
      data-e11-reference-family={sourceFamily}
      data-e11-reference-renderer={rendererType}
    >
      <div
        className={`experiment-eleven-reference-host${
          interactive ? ' experiment-eleven-reference-host--interactive' : ''
        }`}
        data-e11-reference-native-width={nativeWidth}
        data-e11-reference-native-height={nativeHeight}
        data-e11-reference-render-width={renderWidth}
        data-e11-reference-render-height={renderHeight}
        data-e11-reference-render-offset-x={renderOffsetX}
        data-e11-reference-render-offset-y={renderOffsetY}
        style={{
          left: hostLeft,
          top: hostTop,
          width: renderWidth,
          height: renderHeight,
          borderRadius: renderRadius,
          transform: `scale(${geometry.scaleX}, ${geometry.scaleY})`,
        }}
      >
        {cloneWallpaper ? (
          <ExperimentElevenWallpaperClone
            geometry={hostGeometry}
            nativeWidth={renderWidth}
            nativeHeight={renderHeight}
          />
        ) : null}
        <div className="experiment-eleven-reference-renderer">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
