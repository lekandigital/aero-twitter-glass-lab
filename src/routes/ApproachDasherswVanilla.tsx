import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachDasherswVanilla() {
  return (
    <ExperimentShell
      title="Dashersw Vanilla JS"
      technique="Vanilla JS liquid glass — dashersw/liquid-glass-js fallback"
      referencePaths={[
        `${REF}/github/liquid-glass-js`,
        `${REF}/github/liquid-glass-js/index.html`,
      ]}
    />
  );
}
