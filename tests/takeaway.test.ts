import { describe, expect, it } from 'vitest'
import { getClass } from '../src/content'
import { pickTakeaway, takeawayPool } from '../src/content/takeaway'
import course from '../content/course.json'

describe('end-of-lesson takeaway', () => {
  it('every pharmacy lesson has a short sentence to take away', () => {
    const cls = getClass('pharmacy')!
    for (const lesson of cls.lessons) {
      const t = pickTakeaway(takeawayPool(cls, lesson), 3)
      expect(t, lesson.id).not.toBeNull()
      expect(t!.en.length).toBeGreaterThan(0)
      expect(t!.ar.length).toBeGreaterThan(0)
    }
  })
  it('podcast term questions carry a word to listen to', () => {
    const cls = getClass('pharmacy')!
    const pod = cls.lessons.find((l) => l.type === 'podcast')
    if (pod?.type !== 'podcast') throw new Error('no podcast')
    const qs = pod.segments.flatMap((s) => s.questions).filter((q) => q.tag !== 'general')
    expect(qs.length).toBeGreaterThan(0)
    for (const q of qs) expect(q.sayEn && q.questionAr.includes(q.sayEn), q.questionAr).toBe(true)
  })
  it('welcome tour has steps with points', () => {
    expect(course.steps.length).toBeGreaterThanOrEqual(5)
    for (const s of course.steps) expect(s.pointsAr.length).toBeGreaterThan(0)
  })
})

describe('word pictures', () => {
  it('every vocab word with an image points to a real file', () => {
    const files = Object.keys(import.meta.glob('/public/art/**/*'))
    const existsSync = (p: string) => files.includes('/' + p)
    const cls = getClass('pharmacy')!
    for (const l of cls.lessons) {
      if (l.type !== 'vocab') continue
      for (const w of l.words) if (w.image) expect(existsSync(`public/${w.image}`), w.image).toBe(true)
    }
    if (cls.cover) expect(existsSync(`public/${cls.cover}`), cls.cover).toBe(true)
  })
})
