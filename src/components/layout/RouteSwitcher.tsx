import { NavLink } from 'react-router-dom';

const routes = [
  { path: '/setup', label: 'Setup' },
  { path: '/liquidgl', label: 'liquidGL' },
  { path: '/react-liquid-glass', label: 'React Liquid Glass' },
  { path: '/css-svg', label: 'CSS / SVG' },
  { path: '/archisvaze-svg', label: 'Archisvaze SVG' },
  { path: '/dashersw', label: 'Dashersw' },
  { path: '/aero-css', label: 'Aero CSS' },
  { path: '/hybrid', label: 'Hybrid' },
  { path: '/references', label: 'References' },
  { path: '/reference-lab', label: 'Reference Lab' },
] as const;

export function RouteSwitcher() {
  return (
    <nav className="route-switcher" aria-label="Experiment routes">
      {routes.map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
