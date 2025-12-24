import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

import ErrorBoundary from './ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

// Register a simple service worker for offline caching when running as a production build
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{})
  })
}
