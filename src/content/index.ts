import levelsData from '../../content/levels.json'
import type { ClassContent, Level } from './types'

export const levels: Level[] = levelsData.levels

// يقرأ كل ملفات content/classes/*.json تلقائيًا.
// لإضافة كلاس جديد: أضف ملفه هنا وسطره في levels.json، بدون تعديل الكود.
const classFiles = import.meta.glob<ClassContent>('../../content/classes/*.json', {
  eager: true,
  import: 'default',
})

export const classContents: Record<string, ClassContent> = Object.fromEntries(
  Object.values(classFiles).map((c) => [c.id, c]),
)

export function getClass(classId: string): ClassContent | undefined {
  return classContents[classId]
}

// الكلاس متاح إذا كان له ملف محتوى
export function isClassAvailable(classId: string): boolean {
  return classId in classContents
}

export function findLevelOfClass(classId: string): Level | undefined {
  return levels.find((l) => l.classes.some((c) => c.id === classId))
}

export const LESSON_ICONS: Record<string, string> = {
  intro: '📖',
  'listen-choose': '👂',
  phrases: '🗣️',
  podcast: '🎙️',
  vocab: '🔤',
  grammar: '🧩',
  'ai-chat': '🤖',
  scene: '🎧',
  film: '🎬',
  review: '🔁',
}

// الكلاس اللي يبدأ منه الطالب حسب مستواه: أول كلاس متاح في مستواه،
// وإذا مستواه ما فيه كلاسات جاهزة نختار أقرب كلاس متاح (الأسهل عند التساوي)
export function startClassFor(levelIndex: number): { classId: string; levelIndex: number } | null {
  const options = levels.flatMap((l, i) =>
    l.classes.filter((c) => isClassAvailable(c.id)).map((c) => ({ classId: c.id, levelIndex: i })),
  )
  if (options.length === 0) return null
  return options.reduce((best, o) =>
    Math.abs(o.levelIndex - levelIndex) < Math.abs(best.levelIndex - levelIndex) ? o : best,
  )
}
