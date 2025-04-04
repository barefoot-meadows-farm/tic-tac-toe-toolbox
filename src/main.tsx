
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGTM } from './utils/analytics'

// Declare global adsbygoogle for TypeScript
declare global {
  interface Window { 
    adsbygoogle: any[] 
  }
}

// Initialize Google Tag Manager
initGTM('GTM-56HL3TRC'); // Replace with your GTM ID

createRoot(document.getElementById("root")!).render(<App />);
