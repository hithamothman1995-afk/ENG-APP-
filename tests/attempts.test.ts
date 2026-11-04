import { describe, expect, it } from 'vitest'
import { attemptPoints, isSettled, MAX_ATTEMPTS } from '../src/logic/attempts'
import { starsFromAccuracy } from '../src/logic/rewards'

describe('two attempts', () => {
  it('gives full point first try, half on second, none after', () => {
    expect(MAX_ATTEMPTS).toBe(2)
    expect(attemptPoints(1)).toBe(1)
    expect(attemptPoints(2)).toBe(0.5)
    expect(attemptPoints(3)).toBe(0)
  })
  it('settles on a right answer or after the second wrong one', () => {
    expect(isSettled(true, 1)).toBe(true)
    expect(isSettled(false, 1)).toBe(false)
    expect(isSettled(false, 2)).toBe(true)
  })
  it('half points feed the star rule', () => {
    // 4 من أول مرة + 1 من ثاني مرة من 5 = 4.5/5 = 0.9 → نجمتان
    expect(starsFromAccuracy(4 + 0.5, 5)).toBe(2)
  })
})
