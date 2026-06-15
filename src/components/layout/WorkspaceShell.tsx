import type { ReactNode } from 'react';
import { AeroWallpaper } from './AeroWallpaper';
import { RouteSwitcher } from './RouteSwitcher';

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <>
      <AeroWallpaper />
      <div className="workspace-page">
        <RouteSwitcher />
        {children}
      </div>
    </>
  );
}

type ExperimentShellProps = {
  title: string;
  technique: string;
  referencePaths: string[];
  children?: ReactNode;
};

export function ExperimentShell({
  title,
  technique,
  referencePaths,
  children,
}: ExperimentShellProps) {
  return (
    <section className="workspace-panel">
      <h1>{title}</h1>
      <p className="workspace-meta">
        <strong>Intended technique:</strong> {technique}
      </p>

      <h2>Local reference paths (for later)</h2>
      <ul className="workspace-refs">
        {referencePaths.map((path) => (
          <li key={path}>{path}</li>
        ))}
      </ul>

      <p className="workspace-status">
        Not implemented yet — workspace setup only.
      </p>

      {children}
    </section>
  );
}
