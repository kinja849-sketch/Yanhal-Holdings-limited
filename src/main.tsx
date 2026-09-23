import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error filtering to suppress harmless development noise (Vite WebSockets)
if (typeof window !== 'undefined') {
  const isWebSocketError = (msg: any) => {
    const str = String(msg);
    return str.includes('WebSocket') || str.includes('vite');
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWebSocketError(event.reason) || isWebSocketError(event.reason?.message)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  });

  window.addEventListener('error', (event) => {
    if (isWebSocketError(event.message) || isWebSocketError(event.error)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  });

  // Also patch console.error to avoid noise in the log stream
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.some(arg => isWebSocketError(arg))) return;
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
