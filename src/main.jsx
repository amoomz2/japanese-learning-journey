import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ProgressProvider } from './state/progress.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </React.StrictMode>,
)
