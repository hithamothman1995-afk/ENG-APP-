// المراجعة الذكية: كل عبارة أو كلمة أو تعبير لها بطاقة، وخوارزمية FSRS تحدد متى ترجع لك
// (قبل ما تنساها بقليل). مكتبة ts-fsrs مجانية برخصة MIT.
import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs'
import type { ClassContent } from '../content/types'
import type { Progress } from '../storage/progress'

// بدون خطوات الدقائق القصيرة: التطبيق يومي، فأقل مدة يوم
const scheduler = fsrs({ enable_short_term: false })

export interface ReviewItem {
  key: string // "classId/itemId"
  ar: string
  en: string
}

// البطاقة محفوظة كنص JSON عادي في التقدم (التواريخ نصوص)
export type StoredCard = Omit<Card, 'due' | 'last_review'> & { due: string; last_review?: string }

// كل عناصر المراجعة في الكلاس، ومن أي درس تنفتح
export function classItems(cls: ClassContent): (ReviewItem & { lessonId: string })[] {
  const list: (ReviewItem & { lessonId: string })[] = []
  for (const l of cls.lessons) {
    if (l.type === 'phrases') {
      l.phrases.forEach((p) => list.push({ key: `${cls.id}/${p.id}`, ar: p.ar, en: p.en, lessonId: l.id }))
      l.idioms.forEach((i) => list.push({ key: `${cls.id}/${i.id}`, ar: i.meaningAr, en: i.en, lessonId: l.id }))
    }
    if (l.type === 'vocab') l.words.forEach((w) => list.push({ key: `${cls.id}/w-${w.id}`, ar: w.ar, en: w.en, lessonId: l.id }))
  }
  return list
}

// العناصر اللي تعلّمها الطالب: درسها مكتمل
export function learnedItems(p: Progress, classes: ClassContent[]): ReviewItem[] {
  return classes.flatMap((c) => classItems(c).filter((i) => p.lessons[`${c.id}/${i.lessonId}`]))
}

// المستحق اليوم: عنصر متعلَّم وما راجعه أبدًا، أو موعده جاء
export function dueItems(p: Progress, classes: ClassContent[], now: Date): ReviewItem[] {
  const srs = p.srs ?? {}
  return learnedItems(p, classes)
    .filter((i) => !srs[i.key] || new Date(srs[i.key].due) <= now)
    .sort((a, b) => (srs[a.key]?.due ?? '').localeCompare(srs[b.key]?.due ?? ''))
}

function revive(c: StoredCard): Card {
  return { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined }
}

// يسجّل نتيجة المراجعة: عرفها (Good) أو ما عرفها (Again)
export function gradeItem(p: Progress, key: string, knew: boolean, now: Date): Progress {
  const current = p.srs?.[key]
  const card = current ? revive(current) : createEmptyCard(now)
  const next = scheduler.next(card, now, knew ? Rating.Good : Rating.Again).card
  const stored: StoredCard = {
    ...next,
    due: next.due.toISOString(),
    last_review: next.last_review ? new Date(next.last_review).toISOString() : undefined,
  }
  return { ...p, srs: { ...p.srs, [key]: stored } }
}
