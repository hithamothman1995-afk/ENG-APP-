import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { warmUpVoices } from './audio/speech'
import { loadPlacement } from './storage/placement'
import { ProgressProvider } from './storage/ProgressContext'
import './styles/app.css'

warmUpVoices()

// أول مرة يفتح الطالب التطبيق: اختبار تحديد المستوى قبل أي شي، وبعده الجولة الترحيبية
if (!loadPlacement() && /^#?\/?$/.test(window.location.hash)) window.location.replace('#/placement')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
)
