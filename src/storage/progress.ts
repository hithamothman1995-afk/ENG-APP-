// كل تقدم المتعلم محفوظ على الجهاز في localStorage تحت مفتاح واحد
import { dayKey } from '../logic/dates'

const STORAGE_KEY = 'eng-app:progress:v1'

export interface DayActivity {
  seconds: number
  lessonsCompleted: number
}

export interface LessonRecord {
  completedAt: string
  stars: number
}

export interface Progress {
  version: 1
  xp: number
  lessons: Record<string, LessonRecord> // المفتاح: "classId/lessonId"
  lastLesson: { classId: string; lessonId: string } | null
  activity: Record<string, DayActivity> // المفتاح: يوم مثل "2026-10-25"
  difficulty?: Record<string, Difficulty> // رأي المتعلم في صعوبة كل درس
}

export type Difficulty = 'easy' | 'ok' | 'hard'

export function setDifficulty(p: Progress, classId: string, lessonId: string, d: Difficulty): Progress {
  return { ...p, difficulty: { ...p.difficulty, [lessonKey(classId, lessonId)]: d } }
}

export function emptyProgress(): Progress {
  return { version: 1, xp: 0, lessons: {}, lastLesson: null, activity: {} }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Progress
    if (parsed.version !== 1) return emptyProgress()
    return { ...emptyProgress(), ...parsed }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // التخزين غير متاح (مثل التصفح الخاص): نكمل بدون حفظ
  }
}

export function lessonKey(classId: string, lessonId: string): string {
  return `${classId}/${lessonId}`
}

function touchDay(p: Progress, now: Date): DayActivity {
  const key = dayKey(now)
  return p.activity[key] ?? { seconds: 0, lessonsCompleted: 0 }
}

export function addStudySeconds(p: Progress, seconds: number, now = new Date()): Progress {
  const day = touchDay(p, now)
  return {
    ...p,
    activity: { ...p.activity, [dayKey(now)]: { ...day, seconds: day.seconds + seconds } },
  }
}

export function setLastLesson(p: Progress, classId: string, lessonId: string): Progress {
  return { ...p, lastLesson: { classId, lessonId } }
}
