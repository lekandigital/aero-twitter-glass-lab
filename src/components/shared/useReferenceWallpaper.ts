import { useCallback, useEffect, useState } from 'react';
import {
  applyReferenceWallpaperDom,
  readReferenceWallpaperPreference,
  subscribeReferenceWallpaper,
  writeReferenceWallpaperPreference,
} from './workspaceWallpaper';

export function useReferenceWallpaper() {
  const [referenceWallpaper, setReferenceWallpaper] = useState(readReferenceWallpaperPreference);

  useEffect(() => {
    applyReferenceWallpaperDom(readReferenceWallpaperPreference());
    return subscribeReferenceWallpaper(setReferenceWallpaper);
  }, []);

  const toggleReferenceWallpaper = useCallback(() => {
    writeReferenceWallpaperPreference(!referenceWallpaper);
  }, [referenceWallpaper]);

  return { referenceWallpaper, toggleReferenceWallpaper, setReferenceWallpaper: writeReferenceWallpaperPreference };
}
