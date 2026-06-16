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
import './styles/experiment-set-four.css';
import './styles/material-settings.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
