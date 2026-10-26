import { describe, expect, it } from 'vitest'
import pharmacy from '../content/classes/pharmacy.json'
import type { ClassContent } from '../src/content/types'
import { buildTurns, cleanAnswer, lessonContext, THOMSON_RULES } from '../src/ai/thomson'

const cls = pharmacy as unknown as ClassContent

describe('Thomson', () => {
  it('builds a context for every lesson of the class', () => {
    for (const l of cls.lessons) {
      const c = lessonContext(cls, l)
      expect(c).toContain(l.titleAr)
      expect(c.length).toBeLessThanOrEqual(6000)
    }
    const phrases = cls.lessons.find((l) => l.type === 'phrases')!
    expect(lessonContext(cls, phrases)).toContain('under the weather')
  })

  it('starts with the rules and ends on the new question', () => {
    const turns = buildTurns('ctx', 'screen', [], 'ما معنى dose؟')
    expect(turns[0].role).toBe('user')
    expect(turns[0].content).toContain(THOMSON_RULES)
    expect(turns.at(-1)).toEqual({ role: 'user', content: 'ما معنى dose؟' })
  })

  it('keeps only recent history and never starts history on an assistant turn', () => {
    const history = Array.from({ length: 15 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: String(i) }))
    const turns = buildTurns('ctx', '', history, 'q')
    expect(turns.length).toBeLessThanOrEqual(12)
    expect(turns[1].role).toBe('user')
  })

  it('removes markdown the model may add', () => {
    expect(cleanAnswer('**does** مع he\n## عنوان\n- نقطة')).toBe('does مع he\nعنوان\n• نقطة')
  })
})
