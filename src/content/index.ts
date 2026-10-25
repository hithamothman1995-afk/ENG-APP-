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
  phrases: '🗣️',
  vocab: '🔤',
  'vocab-practice': '✍️',
  idiom: '💡',
  listening: '🎧',
  grammar: '🧩',
  'ai-chat': '🤖',
  review: '🔁',
}
