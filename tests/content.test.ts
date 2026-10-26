import { describe, expect, it } from 'vitest'
import levelsData from '../content/levels.json'
import pharmacy from '../content/classes/pharmacy.json'
import type { ChoiceQuestion, ClassContent, Exercise } from '../src/content/types'

const cls = pharmacy as unknown as ClassContent
const ORDER = ['intro', 'listen-choose', 'phrases', 'podcast', 'vocab', 'grammar', 'listen-choose', 'ai-chat', 'listen-choose', 'scene', 'review']

function checkChoice(q: { options: string[]; answer: number }) {
  expect(q.answer).toBeGreaterThanOrEqual(0)
  expect(q.answer).toBeLessThan(q.options.length)
  expect(new Set(q.options).size).toBe(q.options.length)
}

function checkExercise(e: Exercise) {
  if (e.kind === 'type') expect(e.answer.trim().length).toBeGreaterThan(0)
  else checkChoice(e)
  if (e.kind === 'fill') expect(e.sentence).toContain('___')
}

function lessonOf<T extends ClassContent['lessons'][number]['type']>(type: T) {
  return cls.lessons.filter((l) => l.type === type) as Extract<ClassContent['lessons'][number], { type: T }>[]
}

describe('pharmacy content', () => {
  it('follows the class order with unique ids', () => {
    expect(cls.lessons.map((l) => l.type)).toEqual(ORDER)
    expect(new Set(cls.lessons.map((l) => l.id)).size).toBe(cls.lessons.length)
  })

  it('is listed in levels.json under its level', () => {
    const level = levelsData.levels.find((l) => l.id === cls.levelId)
    expect(level?.classes.some((c) => c.id === cls.id)).toBe(true)
  })

  it('has valid answers for every exercise and question', () => {
    for (const l of lessonOf('grammar')) l.exercises.forEach(checkExercise)
    for (const l of lessonOf('listen-choose')) l.items.forEach(checkChoice)
    for (const l of lessonOf('scene')) l.questions.forEach((q: ChoiceQuestion) => checkChoice(q))
    for (const w of lessonOf('vocab')[0].words) {
      expect(w.distractors).toHaveLength(2)
      expect(w.distractors).not.toContain(w.en)
    }
  })

  it('plays the right sentence among the options when choosing what you heard', () => {
    for (const l of lessonOf('listen-choose').filter((x) => x.mode === 'sentence')) {
      for (const it of l.items) expect(it.options[it.answer]).toBe(it.audioEn)
    }
  })

  it('has a translation and an Arab-learner sound focus for each phrase, plus five idioms', () => {
    const phrases = lessonOf('phrases')[0]
    for (const p of phrases.phrases) {
      expect(p.ar.length).toBeGreaterThan(0)
      expect(p.en.toLowerCase()).toContain(p.focus!.word.toLowerCase())
    }
    expect(phrases.idioms).toHaveLength(5)
    const ids = new Set(phrases.phrases.map((p) => p.id))
    for (const id of lessonOf('ai-chat')[0].targetPhraseIds) expect(ids.has(id)).toBe(true)
  })

  it('has a podcast of 5 parts with 5 questions each (term, idiom, general) and all five idioms', () => {
    const podcast = lessonOf('podcast')[0]
    expect(podcast.segments).toHaveLength(5)
    const text = podcast.segments.flatMap((s) => s.lines.map((l) => l.en.toLowerCase())).join(' ')
    for (const s of podcast.segments) {
      expect(s.questions).toHaveLength(5)
      s.questions.forEach(checkChoice)
      for (const tag of ['term', 'idiom', 'general']) expect(s.questions.some((q) => q.tag === tag)).toBe(true)
      for (const l of s.lines) expect(podcast.characters[l.speaker]).toBeTruthy()
    }
    for (const idiom of lessonOf('phrases')[0].idioms) {
      const core = idiom.en.toLowerCase().replace(/^to be /, '').replace(/\.$/, '')
      expect(text).toContain(core)
    }
    const words = text.split(/\s+/).length
    expect(words).toBeGreaterThan(1000) // حوالي 10 دقائق بسرعة المبتدئين
  })

  it('has scene lines for known characters', () => {
    const scene = lessonOf('scene')[0]
    for (const l of scene.lines) {
      expect(scene.characters[l.speaker]).toBeTruthy()
      expect(l.ar.length).toBeGreaterThan(0)
    }
  })
})
