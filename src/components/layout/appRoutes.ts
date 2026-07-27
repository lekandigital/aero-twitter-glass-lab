/**
 * The single central route list.
 *
 * Both the full workspace navigation and the compact navigation used by the
 * standalone experiment pages render from this array — standalone pages must
 * never define their own copy. It lives in a plain `.ts` leaf module (no JSX) so
 * that audit scripts and `node --test` can import it directly.
 */

export type AppRoute = {
  path: string;
  label: string;
  external?: boolean;
};

export const APP_ROUTES: readonly AppRoute[] = [
  { path: '/setup', label: 'Setup' },
  { path: '/liquidgl', label: 'liquidGL' },
  { path: '/react-liquid-glass', label: 'React Liquid Glass' },
  { path: '/css-svg', label: 'CSS / SVG' },
  { path: '/archisvaze-svg', label: 'Archisvaze SVG' },
  { path: '/dashersw', label: 'Dashersw' },
  { path: '/aero-css', label: 'Aero CSS' },
  { path: '/hybrid', label: 'Hybrid' },
  { path: '/approach-1', label: 'Approach 1' },
  { path: '/approach-2', label: 'Approach 2' },
  { path: '/experiment-set-1', label: 'Experiment Set 1' },
  { path: '/button-source-experiments', label: 'Button Source Experiments' },
  { path: '/showcase', label: 'Showcase' },
  { path: '/references', label: 'References' },
  { path: '/reference-lab', label: 'Reference Lab' },
  { path: '/raw-reference-lab/', label: 'Raw Reference Lab', external: true },
];
