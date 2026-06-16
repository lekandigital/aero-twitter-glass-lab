import type { E1MaterialSettings } from '../experiment-one/materialSettings';
import type { E2MaterialSettings } from '../experiment-set-two/materialSettings';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
import {
  E1_MASTER_DEFAULT,
  E2_MASTER_DEFAULT,
  E3_MASTER_DEFAULT,
  E4_MASTER_DEFAULT,
} from './masterDefaults';

const SESSION_KEY = 'experiment-set-1-session';

export type ExperimentSetOneSession = {
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4: E4MaterialSettings;
  hidePanelText: boolean;
  inspectMode: boolean;
};

export function defaultSession(): ExperimentSetOneSession {
  return {
    e1: E1_MASTER_DEFAULT,
    e2: E2_MASTER_DEFAULT,
    e3: E3_MASTER_DEFAULT,
    e4: E4_MASTER_DEFAULT,
    hidePanelText: false,
    inspectMode: true,
  };
}

export function loadExperimentSetOneSession(): ExperimentSetOneSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExperimentSetOneSession>;
    if (!parsed?.e1 || !parsed?.e2 || !parsed?.e3) return null;
    return {
      e1: parsed.e1,
      e2: parsed.e2,
      e3: parsed.e3,
      e4: normalizeE4MaterialSettings(parsed.e4),
      hidePanelText: Boolean(parsed.hidePanelText),
      inspectMode: parsed.inspectMode !== false,
    };
  } catch {
    return null;
  }
}

export function saveExperimentSetOneSession(session: ExperimentSetOneSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
