import { describe, expect, it } from 'vitest'
import levelsData from '../content/levels.json'
import type { ClassContent, Exercise } from '../src/content/types'

// كلاسات المستوى الأول: نسخة المبتدئين بـ7 دروس
const ORDER = ['intro', 'listen-choose', 'phrases', 'vocab', 'grammar', 'scene', 'review']
const files = import.meta.glob<ClassContent>('../content/classes/*.json', { eager: true, import: 'default' })
const beginner = Object.values(files).filter((c) => c.levelId === 'trial')

function checkChoice(q: { options: string[]; answer: number }) {
  expect(q.answer).toBeGreaterThanOrEqual(0)
  expect(q.answer).toBeLessThan(q.options.length)
  expect(new Set(q.options).size).toBe(q.options.length)
}

describe.each(beginner.map((c) => [c.id, c] as const))('beginner class %s', (_, cls) => {
  const of = <T extends ClassContent['lessons'][number]['type']>(t: T) =>
    cls.lessons.filter((l) => l.type === t) as Extract<ClassContent['lessons'][number], { type: T }>[]

  it('has the 7 beginner lessons in order and is listed in level 1', () => {
    expect(cls.lessons.map((l) => l.type)).toEqual(ORDER)
    expect(new Set(cls.lessons.map((l) => l.id)).size).toBe(ORDER.length)
    expect(levelsData.levels[0].classes.some((c) => c.id === cls.id)).toBe(true)
  })

  it('has valid questions everywhere', () => {
    for (const l of of('listen-choose')) {
      l.items.forEach(checkChoice)
      if (l.mode === 'sentence') for (const it of l.items) expect(it.options[it.answer]).toBe(it.audioEn)
    }
    for (const e of of('grammar')[0].exercises as Exercise[]) {
      if (e.kind !== 'type') checkChoice(e)
      if (e.kind === 'fill') expect(e.sentence).toContain('___')
    }
    for (const w of of('vocab')[0].words) {
      expect(w.distractors).toHaveLength(2)
      expect(w.distractors).not.toContain(w.en)
    }
    const scene = of('scene')[0]
    scene.questions.forEach(checkChoice)
    for (const l of scene.lines) {
      expect(scene.characters[l.speaker]?.gender).toMatch(/^(female|male)$/)
      expect(l.ar.length).toBeGreaterThan(0)
    }
  })

  it('has translated phrases, sound focus inside the phrase, and five expressions', () => {
    const p = of('phrases')[0]
    for (const x of p.phrases) {
      expect(x.ar.length).toBeGreaterThan(0)
      if (x.focus) expect(x.en.toLowerCase()).toContain(x.focus.word.toLowerCase())
    }
    expect(p.phrases.filter((x) => x.focus).length).toBeGreaterThanOrEqual(3)
    expect(p.idioms).toHaveLength(5)
  })
})

it('has at least one beginner class', () => {
  expect(beginner.length).toBeGreaterThan(0)
})
