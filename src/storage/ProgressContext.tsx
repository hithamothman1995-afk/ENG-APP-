import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadProgress, saveProgress, type Progress } from './progress'

interface Ctx {
  progress: Progress
  update: (fn: (p: Progress) => Progress) => void
}

const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => saveProgress(progress), [progress])

  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), [])

  return <ProgressContext.Provider value={{ progress, update }}>{children}</ProgressContext.Provider>
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
