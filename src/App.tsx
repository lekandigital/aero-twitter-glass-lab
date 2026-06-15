import { Navigate, Route, Routes } from 'react-router-dom';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import { SetupDashboard } from './routes/SetupDashboard';
import { ApproachLiquidGL } from './routes/ApproachLiquidGL';
import { ApproachReactLiquidGlass } from './routes/ApproachReactLiquidGlass';
import { ApproachCssSvgOnly } from './routes/ApproachCssSvgOnly';
import { ApproachArchisvazeSvg } from './routes/ApproachArchisvazeSvg';
import { ApproachDasherswVanilla } from './routes/ApproachDasherswVanilla';
import { ApproachAeroCssFallback } from './routes/ApproachAeroCssFallback';
import { ApproachHybridFinal } from './routes/ApproachHybridFinal';
import { ReferencesStatus } from './routes/ReferencesStatus';

function App() {
  return (
    <WorkspaceShell>
      <Routes>
        <Route path="/" element={<Navigate to="/setup" replace />} />
        <Route path="/setup" element={<SetupDashboard />} />
        <Route path="/liquidgl" element={<ApproachLiquidGL />} />
        <Route path="/react-liquid-glass" element={<ApproachReactLiquidGlass />} />
        <Route path="/css-svg" element={<ApproachCssSvgOnly />} />
        <Route path="/archisvaze-svg" element={<ApproachArchisvazeSvg />} />
        <Route path="/dashersw" element={<ApproachDasherswVanilla />} />
        <Route path="/aero-css" element={<ApproachAeroCssFallback />} />
        <Route path="/hybrid" element={<ApproachHybridFinal />} />
        <Route path="/references" element={<ReferencesStatus />} />
      </Routes>
    </WorkspaceShell>
  );
}

export default App;
