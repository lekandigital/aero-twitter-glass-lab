import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF_ROOT = '/Users/lekan/Dev/aero-twitter-glass-references';

export function SetupDashboard() {
  return (
    <ExperimentShell
      title="Setup Dashboard"
      technique="Workspace overview — no glass implementation yet"
      referencePaths={[
        `${REF_ROOT}`,
        `${REF_ROOT}/REFERENCE_MANIFEST.md`,
        `${REF_ROOT}/CODEPEN_EXPORT_AUDIT.md`,
        `${REF_ROOT}/codepen-extracted`,
        '/Users/lekan/Downloads/zipsofglass2',
        '/Users/lekan/Dev/aero-twitter-glass-lab/public/aero-bg.png',
        '/Users/lekan/Dev/aero-twitter-glass-lab/public/reference.png',
      ]}
    />
  );
}
