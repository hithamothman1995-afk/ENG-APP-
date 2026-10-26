import { describe, expect, it } from 'vitest'
import { bestMatch, compareSpeech, speechStars, tokens } from '../src/logic/compare'

describe('speech vs target comparison', () => {
  it('gives full accuracy for the same sentence regardless of case and punctuation', () => {
    const c = compareSpeech('Can I pay by card?', 'can i pay by card')
    expect(c.accuracy).toBe(1)
    expect(c.words.every((w) => w.status === 'ok')).toBe(true)
  })

  it('treats contractions and digits as the full words', () => {
    expect(tokens("I'm taking 2 pills")).toEqual(['i', 'am', 'taking', 'two', 'pills'])
    expect(compareSpeech("I'm allergic to penicillin.", 'I am allergic to penicillin').accuracy).toBe(1)
  })

  it('marks a wrong word and explains the p/b confusion explicitly', () => {
    const c = compareSpeech('Can I pay by card?', 'can I bay by card')
    expect(c.words[2]).toEqual({ target: 'pay', heard: 'bay', status: 'wrong' })
    expect(c.accuracy).toBeCloseTo(0.8)
    expect(c.tipsAr[0]).toContain('قلت bay، والمطلوب pay')
    expect(c.tipsAr[0]).toContain('الحنجرة')
  })

  it('explains v/f, short i and ng mistakes', () => {
    expect(compareSpeech('cheaper version', 'cheaper fersion').tipsAr[0]).toContain('حرف v')
    expect(compareSpeech('how many pills', 'how many peels').tipsAr[0]).toContain('قصير')
    expect(compareSpeech('nice evening', 'nice evenink').tipsAr[0]).toContain('ng')
  })

  it('marks missing words and penalises extra ones', () => {
    const missing = compareSpeech('Is there a cheaper version?', 'is there a version')
    expect(missing.words.find((w) => w.target === 'cheaper')?.status).toBe('missing')
    expect(missing.accuracy).toBeCloseTo(0.8)
    const extra = compareSpeech('Thank you.', 'thank you very much')
    expect(extra.extra).toEqual(['very', 'much'])
    expect(extra.accuracy).toBe(0.5)
  })

  it('handles empty speech', () => {
    const c = compareSpeech('Hello there', '')
    expect(c.accuracy).toBe(0)
    expect(c.words.every((w) => w.status === 'missing')).toBe(true)
  })

  it('picks the closest browser alternative', () => {
    const r = bestMatch('Can I pay by card?', ['can I bay by car', 'can I pay by card'])
    expect(r.heard).toBe('can I pay by card')
    expect(r.comparison.accuracy).toBe(1)
  })

  it('turns accuracy into stars', () => {
    expect(speechStars(1)).toBe(3)
    expect(speechStars(0.8)).toBe(2)
    expect(speechStars(0.5)).toBe(1)
    expect(speechStars(0.2)).toBe(0)
  })
})
