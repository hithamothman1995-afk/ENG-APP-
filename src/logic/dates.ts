// مفتاح اليوم بالتوقيت المحلي للجهاز، مثل "2026-10-25"
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

// آخر n أيام، من الأقدم إلى اليوم
export function lastNDays(today: Date, n: number): string[] {
  return Array.from({ length: n }, (_, i) => dayKey(addDays(today, i - (n - 1))))
}
