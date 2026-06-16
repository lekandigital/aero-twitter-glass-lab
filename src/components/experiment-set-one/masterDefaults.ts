import { E1_DEFAULT_SETTINGS } from '../experiment-one/materialSettings';
import { E2_DEFAULT_SETTINGS } from '../experiment-set-two/materialSettings';
import { buildInitialE3Settings } from '../experiment-set-three/materialSettings';
import { buildE4MasterDefaultSettings } from '../experiment-set-four/materialSettings';

/** Values each experiment had when first introduced — used by Reset and per-field master default. */
export const E1_MASTER_DEFAULT = E1_DEFAULT_SETTINGS;
export const E2_MASTER_DEFAULT = E2_DEFAULT_SETTINGS;
export const E3_MASTER_DEFAULT = buildInitialE3Settings();
export const E4_MASTER_DEFAULT = buildE4MasterDefaultSettings();
