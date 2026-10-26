import { useSyncExternalStore } from 'react'

// سرعة النطق المفضلة، محفوظة في المتصفح
const KEY = 'eng-app:rate'
export const RATES = [
  { value: 0.7, label: 'بطيء' },
  { value: 0.9, label: 'عادي' },
] as const

function read(): number {
  try {
    const v = Number(localStorage.getItem(KEY))
    return RATES.some((r) => r.value === v) ? v : 0.9
  } catch {
    return 0.9
  }
}

let rate = read()
const listeners = new Set<() => void>()

export function setRate(value: number) {
  rate = value
  try {
    localStorage.setItem(KEY, String(value))
  } catch {
    // التخزين غير متاح: نكتفي بالقيمة في الذاكرة
  }
  listeners.forEach((l) => l())
}

export function useRate(): number {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => rate,
  )
}
