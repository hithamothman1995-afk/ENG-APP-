import type { Bilingual, ClassContent, Lesson } from './types'

// "جملة تاخذها معك" بعد نهاية الدرس: كل الجمل المفيدة في الدرس، ونختار منها وحدة
export function takeawayPool(cls: ClassContent, lesson: Lesson): Bilingual[] {
  switch (lesson.type) {
    case 'listen-choose':
      return lesson.items.map((i) => ({ en: i.audioEn, ar: i.ar ?? (lesson.mode === 'meaning' ? i.options[i.answer] : '') })).filter((b) => b.ar)
    case 'phrases':
      return [...lesson.phrases, ...lesson.idioms.map((i) => ({ en: i.en, ar: i.meaningAr }))]
    case 'podcast':
      return lesson.segments.flatMap((s) => s.newTerms)
    case 'vocab':
      return lesson.words.map((w) => ({ en: w.exampleEn, ar: w.exampleAr }))
    case 'scene':
      return lesson.lines.map((l) => ({ en: l.en, ar: l.ar }))
    default: {
      // المقدمة والقواعد والمحادثة والمراجعة: عبارات الكلاس
      const phrases = cls.lessons.flatMap((l) => (l.type === 'phrases' ? l.phrases : []))
      return phrases.length ? phrases : []
    }
  }
}

export function pickTakeaway(pool: Bilingual[], seed: number): Bilingual | null {
  const usable = pool.filter((b) => b.en.split(' ').length <= 12)
  const list = usable.length ? usable : pool
  if (!list.length) return null
  return list[Math.abs(Math.floor(seed)) % list.length]
}
