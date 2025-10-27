import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ZetaCalculator from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ZetaCalculator />
  </StrictMode>,
)
