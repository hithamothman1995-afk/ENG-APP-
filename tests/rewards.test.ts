import { describe, expect, it } from 'vitest'
import { completeLesson, phraseLessonStars, starsFromAccuracy } from '../src/logic/rewards'
import { sameAnswer } from '../src/logic/text'
import { emptyProgress } from '../src/storage/progress'

const now = new Date(2026, 9, 25, 10, 0)

describe('starsFromAccuracy', () => {
  it('maps accuracy to 0-3 stars', () => {
    expect(starsFromAccuracy(8, 8)).toBe(3)
    expect(starsFromAccuracy(6, 8)).toBe(2)
    expect(starsFromAccuracy(4, 8)).toBe(1)
    expect(starsFromAccuracy(1, 8)).toBe(0)
    expect(starsFromAccuracy(0, 0)).toBe(3)
  })
})

describe('phraseLessonStars', () => {
  it('averages and rounds down', () => {
    expect(phraseLessonStars([3, 3, 2])).toBe(2)
    expect(phraseLessonStars([3, 3, 3])).toBe(3)
    expect(phraseLessonStars([])).toBe(0)
  })
})

describe('completeLesson', () => {
  it('gives full XP the first time and records today', () => {
    const r = completeLesson(emptyProgress(), 'pharmacy', 'intro', 3, 'phrases', now)
    expect(r.xpGained).toBe(25)
    expect(r.progress.xp).toBe(25)
    expect(r.progress.lessons['pharmacy/intro'].stars).toBe(3)
    expect(r.progress.lastLesson).toEqual({ classId: 'pharmacy', lessonId: 'phrases' })
    expect(r.progress.activity['2026-10-25'].lessonsCompleted).toBe(1)
  })

  it('on repeat gives XP only for improved stars and keeps the best', () => {
    const first = completeLesson(emptyProgress(), 'pharmacy', 'vocab', 2, null, now).progress
    const better = completeLesson(first, 'pharmacy', 'vocab', 3, null, now)
    expect(better.xpGained).toBe(5)
    expect(better.progress.lessons['pharmacy/vocab'].stars).toBe(3)

    const worse = completeLesson(better.progress, 'pharmacy', 'vocab', 2, null, now)
    expect(worse.xpGained).toBe(0)
    expect(worse.improved).toBe(false)
    expect(worse.progress.lessons['pharmacy/vocab'].stars).toBe(3)
  })

  it('does not complete a lesson with fewer than two stars', () => {
    const p = emptyProgress()
    const r = completeLesson(p, 'pharmacy', 'vocab', 1, 'grammar', now)
    expect(r.passed).toBe(false)
    expect(r.xpGained).toBe(0)
    expect(r.progress).toBe(p)
    expect(r.progress.lessons['pharmacy/vocab']).toBeUndefined()
  })

  it('keeps the current lesson as last when there is no next one', () => {
    const r = completeLesson(emptyProgress(), 'pharmacy', 'review', 3, null, now)
    expect(r.progress.lastLesson?.lessonId).toBe('review')
  })
})

describe('sameAnswer', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(sameAnswer('  Pill ', 'pill')).toBe(true)
    expect(sameAnswer('receipt.', 'receipt')).toBe(true)
    expect(sameAnswer('reciept', 'receipt')).toBe(false)
    expect(sameAnswer('I’m allergic', "i'm allergic")).toBe(true)
  })
})
