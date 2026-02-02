import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7243/ingest/5a45c003-e1f9-4e86-8045-ad06264f2cfb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'main.jsx:mount', message: 'App root mounted (SPA loaded)', data: { path: window.location.pathname }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'preview', hypothesisId: 'H3' }) }).catch(() => {});
// #endregion

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
