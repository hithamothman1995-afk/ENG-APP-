// الشارات والشهادات: شارة لكل كلاس تخلّص كل دروسه، وشهادة لكل مستوى تخلّص كل كلاساته
import type { ClassContent, Level } from '../content/types'
import type { Progress } from '../storage/progress'

export function classDone(p: Progress, cls: ClassContent): boolean {
  return cls.lessons.length > 0 && cls.lessons.every((l) => p.lessons[`${cls.id}/${l.id}`])
}

// متوسط النجوم في الكلاس
export function classStars(p: Progress, cls: ClassContent): number {
  const stars = cls.lessons.map((l) => p.lessons[`${cls.id}/${l.id}`]?.stars ?? 0)
  return stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : 0
}

export interface LevelStatus {
  done: number // كلاسات مكتملة
  total: number // كل كلاسات المستوى
  complete: boolean
}

// المستوى يكتمل لمن كل كلاساته تكون جاهزة ومكتملة
export function levelStatus(p: Progress, level: Level, contents: Record<string, ClassContent>): LevelStatus {
  const done = level.classes.filter((c) => contents[c.id] && classDone(p, contents[c.id])).length
  return { done, total: level.classes.length, complete: done === level.classes.length }
}
