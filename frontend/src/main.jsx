import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (!window.performance || typeof window.performance.clearMarks !== 'function') {
  if (!window.performance) window.performance = {}
  window.performance.clearMarks = function() {}
  window.performance.clearMeasures = function() {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
