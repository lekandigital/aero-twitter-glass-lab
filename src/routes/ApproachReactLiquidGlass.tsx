import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ApproachReactLiquidGlass() {
  return (
    <ExperimentShell
      title="React Liquid Glass"
      technique="liquid-glass-react — small React controls (pills, badges, selector)"
      referencePaths={[
        `${REF}/github/liquid-glass-react`,
        'npm:liquid-glass-react (installed, not integrated)',
        `${REF}/codepen-extracted/liquid-glass-components`,
        `${REF}/codepen-extracted/liquid-glass-switcher-css`,
      ]}
    />
  );
}
