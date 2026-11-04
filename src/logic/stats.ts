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
export function progressPercent(p: Progress, classes: { id: string; lessons: { id: string }[] }[]): number {
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

// بداية الأسبوع (الأحد) لأي يوم، كمفتاح نصي
export function weekKey(date: Date): string {
  return dayKey(addDays(date, -date.getDay()))
}

export interface StreakInfo {
  days: number
  frozen: string[] // أيام فاتتك وغطّاها يوم السماح
  freezeLeftThisWeek: boolean
}

// الستريك مع يوم سماح واحد في كل أسبوع: إذا فاتك يوم واحد بين يومين تعلّمت فيهم،
// ما تنقطع السلسلة (بس اليوم الفايت ما ينحسب).
export function streakInfo(p: Progress, today: Date): StreakInfo {
  let cursor = isActive(p, dayKey(today)) ? today : addDays(today, -1)
  const used = new Set<string>()
  const frozen: string[] = []
  let days = 0
  for (let guard = 0; guard < 3660; guard++) {
    if (isActive(p, dayKey(cursor))) {
      days++
    } else {
      const week = weekKey(cursor)
      const before = addDays(cursor, -1)
      if (used.has(week) || !isActive(p, dayKey(before))) break
      used.add(week)
      frozen.push(dayKey(cursor))
    }
    cursor = addDays(cursor, -1)
  }
  return { days, frozen, freezeLeftThisWeek: !used.has(weekKey(today)) }
}
