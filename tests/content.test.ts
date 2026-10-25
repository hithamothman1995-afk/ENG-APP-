import { describe, expect, it } from 'vitest'
import levelsData from '../content/levels.json'
import pharmacy from '../content/classes/pharmacy.json'
import type { ClassContent, Exercise } from '../src/content/types'

const cls = pharmacy as ClassContent
const ORDER = ['intro', 'phrases', 'vocab', 'vocab-practice', 'idiom', 'listening', 'grammar', 'ai-chat', 'review']

function checkExercise(e: Exercise) {
  if (e.kind === 'type') {
    expect(e.answer.trim().length).toBeGreaterThan(0)
  } else {
    expect(e.answer).toBeGreaterThanOrEqual(0)
    expect(e.answer).toBeLessThan(e.options.length)
  }
  if (e.kind === 'fill') expect(e.sentence).toContain('___')
}

describe('pharmacy content', () => {
  it('has the nine lesson types in order with unique ids', () => {
    expect(cls.lessons.map((l) => l.type)).toEqual(ORDER)
    expect(new Set(cls.lessons.map((l) => l.id)).size).toBe(cls.lessons.length)
  })

  it('is listed in levels.json under its level', () => {
    const level = levelsData.levels.find((l) => l.id === cls.levelId)
    expect(level?.classes.some((c) => c.id === cls.id)).toBe(true)
  })

  it('has valid answers for every exercise and question', () => {
    for (const l of cls.lessons) {
      if (l.type === 'vocab-practice' || l.type === 'grammar') l.exercises.forEach(checkExercise)
      if (l.type === 'listening') {
        for (const q of l.questions) expect(q.answer).toBeLessThan(q.options.length)
        for (const line of l.dialogue) expect(l.speakers[line.speaker]).toBeTruthy()
      }
    }
  })

  it('has a translation and an Arab-learner sound focus for each phrase', () => {
    const phrases = cls.lessons.find((l) => l.type === 'phrases')
    if (phrases?.type !== 'phrases') throw new Error('missing phrases lesson')
    for (const p of phrases.phrases) {
      expect(p.ar.length).toBeGreaterThan(0)
      expect(p.focus).toBeDefined()
      expect(p.en.toLowerCase()).toContain(p.focus!.word.toLowerCase())
    }
    const ai = cls.lessons.find((l) => l.type === 'ai-chat')
    if (ai?.type !== 'ai-chat') throw new Error('missing ai-chat lesson')
    const ids = new Set(phrases.phrases.map((p) => p.id))
    for (const id of ai.targetPhraseIds) expect(ids.has(id)).toBe(true)
  })

  it('uses the idiom inside the listening dialogue', () => {
    const idiom = cls.lessons.find((l) => l.type === 'idiom')
    const listening = cls.lessons.find((l) => l.type === 'listening')
    if (idiom?.type !== 'idiom' || listening?.type !== 'listening') throw new Error('missing lessons')
    const phrase = idiom.en.replace(/\.$/, '')
    expect(listening.dialogue.some((d) => d.en.includes(phrase))).toBe(true)
  })
})
