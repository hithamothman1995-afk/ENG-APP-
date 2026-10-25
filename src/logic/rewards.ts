import type { Progress } from '../storage/progress'
import { lessonKey } from '../storage/progress'
import { dayKey } from './dates'

export const XP_PER_LESSON = 10
export const XP_PER_STAR = 5
export const MIN_PHRASE_STARS = 2 // لا يكتمل درس العبارات إلا بنجمتين على الأقل لكل عبارة

// نسبة الإجابات الصحيحة ← نجوم من 0 إلى 3
export function starsFromAccuracy(correct: number, total: number): number {
  if (total === 0) return 3
  const ratio = correct / total
  if (ratio >= 1) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.4) return 1
  return 0
}

// نجوم درس العبارات = متوسط أفضل نجوم كل عبارة، مقربًا للأسفل
export function phraseLessonStars(bestStars: number[]): number {
  if (bestStars.length === 0) return 0
  return Math.floor(bestStars.reduce((a, b) => a + b, 0) / bestStars.length)
}

export interface CompletionResult {
  progress: Progress
  xpGained: number
  stars: number
  improved: boolean
}

// تسجيل إكمال درس: أول مرة يعطي كل النقاط، والإعادة تعطي نقاطًا فقط إذا تحسنت النجوم
export function completeLesson(
  p: Progress,
  classId: string,
  lessonId: string,
  stars: number,
  nextLessonId: string | null,
  now = new Date(),
): CompletionResult {
  const key = lessonKey(classId, lessonId)
  const previous = p.lessons[key]
  const best = Math.max(stars, previous?.stars ?? 0)
  const xpGained = previous
    ? Math.max(0, stars - previous.stars) * XP_PER_STAR
    : XP_PER_LESSON + stars * XP_PER_STAR

  const today = dayKey(now)
  const day = p.activity[today] ?? { seconds: 0, lessonsCompleted: 0 }

  return {
    stars,
    xpGained,
    improved: !previous || stars > previous.stars,
    progress: {
      ...p,
      xp: p.xp + xpGained,
      lessons: { ...p.lessons, [key]: { completedAt: now.toISOString(), stars: best } },
      lastLesson: { classId, lessonId: nextLessonId ?? lessonId },
      activity: { ...p.activity, [today]: { ...day, lessonsCompleted: day.lessonsCompleted + 1 } },
    },
  }
}
