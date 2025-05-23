
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Modern React 18 rendering approach
createRoot(document.getElementById("root")!).render(
  <App />
);
