import {
  patchSessionReferenceWallpaper,
  readSessionReferenceWallpaper,
} from '../experiment-set-one/sessionState';

const WORKSPACE_WALLPAPER_KEY = 'workspace-reference-wallpaper';

type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

export function readReferenceWallpaperPreference(): boolean {
  try {
    const workspace = localStorage.getItem(WORKSPACE_WALLPAPER_KEY);
    if (workspace === '1') return true;
    if (workspace === '0') return false;
  } catch {
    /* ignore */
  }

  const sessionValue = readSessionReferenceWallpaper();
  if (sessionValue !== null) return sessionValue;

  return false;
}

export function applyReferenceWallpaperDom(enabled: boolean) {
  const root = document.documentElement;
  if (enabled) {
    root.dataset.workspaceWallpaper = 'compare';
  } else {
    delete root.dataset.workspaceWallpaper;
  }
}

export function writeReferenceWallpaperPreference(enabled: boolean) {
  try {
    localStorage.setItem(WORKSPACE_WALLPAPER_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
  patchSessionReferenceWallpaper(enabled);
  applyReferenceWallpaperDom(enabled);
  listeners.forEach((listener) => listener(enabled));
}

export function subscribeReferenceWallpaper(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
