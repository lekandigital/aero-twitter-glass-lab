import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/aero-background.css';
import './styles/workspace.css';
import './styles/reference-lab.css';
import './styles/approach-one.css';
import './styles/approach-two.css';
import './styles/experiment-one.css';
import './styles/experiment-set-two.css';
import './styles/experiment-set-three.css';
// experiment-set-four.css is injected scoped per render-variant (incl. the default
// no-variant state) by src/render-variants/injectVariantStyles.ts, so it is NOT
// imported globally here — that would leak main's rules into active variants.
import './styles/showcase-align.css';
import './styles/experiment-set-one-camera.css';
import './styles/glass-frost-surface.css';
import './styles/material-settings.css';
import './styles/experiment-set-six.css';
import './styles/experiment-eleven-haze.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
