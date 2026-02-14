import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './index.css'

// Add polyfill for global in browser environment (needed for some PDF libraries)
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
