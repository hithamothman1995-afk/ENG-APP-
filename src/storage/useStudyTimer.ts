import { useEffect } from 'react'
import { addStudySeconds } from './progress'
import { useProgress } from './ProgressContext'

const TICK_SECONDS = 15

// يحسب وقت التعلم فقط وأنت داخل كلاس أو درس، والصفحة ظاهرة على الشاشة
export function useStudyTimer(active: boolean) {
  const { update } = useProgress()
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        update((p) => addStudySeconds(p, TICK_SECONDS))
      }
    }, TICK_SECONDS * 1000)
    return () => window.clearInterval(id)
  }, [active, update])
}
