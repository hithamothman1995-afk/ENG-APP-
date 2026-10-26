import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { warmUpVoices } from './audio/speech'
import { ProgressProvider } from './storage/ProgressContext'
import './styles/app.css'

warmUpVoices()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
)
