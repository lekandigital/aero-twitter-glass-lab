import { ExperimentShell } from '../components/layout/WorkspaceShell';

const REF = '/Users/lekan/Dev/aero-twitter-glass-references';

export function ReferencesStatus() {
  return (
    <ExperimentShell
      title="References Status"
      technique="Pointer map to external reference library and CodePen exports"
      referencePaths={[
        REF,
        `${REF}/codepen-extracted`,
        `${REF}/all_zip_contents.txt`,
        `${REF}/CODEPEN_EXPORT_AUDIT.md`,
        `${REF}/REFERENCE_MANIFEST.md`,
        `${REF}/DOWNLOAD_REPORT.md`,
        '/Users/lekan/Downloads/zipsofglass2',
        '/Users/lekan/Downloads/zipsofglass2/extracted',
        '/Users/lekan/Downloads/zipsofglass2/all_zip_contents.txt',
      ]}
    />
  );
}
