import { describe, expect, it } from 'vitest'
import placement from '../content/placement.json'
import levelsData from '../content/levels.json'
import { askedCount, nextPlacementStep, type PlacementBand } from '../src/logic/placement'

const bands = placement.bands as PlacementBand[]
const T = true
const F = false

describe('placement content', () => {
  it('has one band per level, in the same order, with 3 questions of 4 options', () => {
    expect(bands.map((b) => b.levelId)).toEqual(levelsData.levels.map((l) => l.id))
    for (const b of bands) {
      expect(b.items).toHaveLength(3)
      for (const it of b.items) {
        expect(it.options).toHaveLength(4)
        expect(new Set(it.options).size).toBe(4)
        if (it.kind === 'listen') expect(it.audioEn).toBeTruthy()
        else expect(it.textEn).toBeTruthy()
        if (it.kind === 'gap') expect(it.textEn).toContain('___')
      }
    }
  })
})

describe('nextPlacementStep', () => {
  it('starts with the first question of the easiest level', () => {
    expect(nextPlacementStep(bands, [])).toEqual({ kind: 'ask', band: 0, item: 0 })
  })

  it('skips the third question after two right answers', () => {
    expect(nextPlacementStep(bands, [[T, T]])).toEqual({ kind: 'ask', band: 1, item: 0 })
  })

  it('stops at a level after two wrong answers there', () => {
    expect(nextPlacementStep(bands, [[T, T], [F, F]])).toEqual({ kind: 'done', levelIndex: 1 })
  })

  it('asks the third question when the first two are split', () => {
    expect(nextPlacementStep(bands, [[T, F]])).toEqual({ kind: 'ask', band: 0, item: 2 })
    expect(nextPlacementStep(bands, [[T, F, T]])).toEqual({ kind: 'ask', band: 1, item: 0 })
    expect(nextPlacementStep(bands, [[T, F, F]])).toEqual({ kind: 'done', levelIndex: 0 })
  })

  it('places at the top level when every level is passed', () => {
    const all = bands.map(() => [T, T])
    expect(nextPlacementStep(bands, all)).toEqual({ kind: 'done', levelIndex: bands.length - 1 })
    expect(askedCount(all)).toBe(16)
  })
})

describe('startClassFor', () => {
  it('sends every level to the nearest ready class', async () => {
    const { startClassFor } = await import('../src/content')
    expect(startClassFor(1)).toEqual({ classId: 'pharmacy', levelIndex: 1 })
    expect(startClassFor(0)).toEqual({ classId: 'introductions', levelIndex: 0 })
    expect(startClassFor(6)?.classId).toBe('pharmacy')
  })
})
