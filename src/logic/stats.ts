import type { ClassContent } from '../content/types'
import type { Progress } from '../storage/progress'
import { addDays, dayKey, lastNDays } from './dates'

export interface DayStat {
  date: string
  minutes: number
  lessons: number
}

export function weekStats(p: Progress, today: Date) {
  const days: DayStat[] = lastNDays(today, 7).map((date) => {
    const a = p.activity[date]
    return {
      date,
      minutes: a ? Math.round(a.seconds / 60) : 0,
      lessons: a ? a.lessonsCompleted : 0,
    }
  })
  return {
    days,
    totalMinutes: days.reduce((s, d) => s + d.minutes, 0),
    totalLessons: days.reduce((s, d) => s + d.lessons, 0),
  }
}

// نسبة الدروس المكتملة من كل دروس الكلاسات المتاحة
export function progressPercent(p: Progress, classes: ClassContent[]): number {
  let total = 0
  let done = 0
  for (const c of classes) {
    for (const l of c.lessons) {
      total++
      if (p.lessons[`${c.id}/${l.id}`]) done++
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

// يوم نشط = تعلمت فيه دقيقة على الأقل أو أكملت درسًا
export function isActive(p: Progress, date: string): boolean {
  const a = p.activity[date]
  return !!a && (a.seconds >= 60 || a.lessonsCompleted > 0)
}

// ستريك مبدئي بدون يوم الإعفاء (يوم الإعفاء يُضاف في المرحلة 4).
// إذا لم تتعلم اليوم بعد، تبقى السلسلة محسوبة حتى أمس.
export function basicStreak(p: Progress, today: Date): number {
  let cursor = isActive(p, dayKey(today)) ? today : addDays(today, -1)
  let count = 0
  while (isActive(p, dayKey(cursor))) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}
