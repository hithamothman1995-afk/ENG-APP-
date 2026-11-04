import { describe, expect, it } from 'vitest'
import intro from '../content/classes/introductions.json'
import ear from '../content/ear-pairs.json'
import levelsData from '../content/levels.json'
import type { ClassContent } from '../src/content/types'
import { classDone, levelStatus } from '../src/logic/badges'
import { makeRounds, type EarGroup } from '../src/logic/ear'
import { emptyProgress } from '../src/storage/progress'

const cls = intro as unknown as ClassContent

describe('badges', () => {
  it('gives a class badge only when every lesson is done', () => {
    const p = emptyProgress()
    for (const l of cls.lessons.slice(0, -1)) p.lessons[`${cls.id}/${l.id}`] = { completedAt: 'x', stars: 2 }
    expect(classDone(p, cls)).toBe(false)
    p.lessons[`${cls.id}/review`] = { completedAt: 'x', stars: 3 }
    expect(classDone(p, cls)).toBe(true)
  })

  it('keeps the level certificate locked until every class in it is done', () => {
    const p = emptyProgress()
    for (const l of cls.lessons) p.lessons[`${cls.id}/${l.id}`] = { completedAt: 'x', stars: 3 }
    const s = levelStatus(p, levelsData.levels[0], { [cls.id]: cls })
    expect(s).toEqual({ done: 1, total: 5, complete: false })
  })
})

describe('ear training', () => {
  const groups = ear.groups as EarGroup[]
  it('has real minimal pairs', () => {
    for (const g of groups) for (const [a, b] of g.pairs) expect(a).not.toBe(b)
  })

  it('cycles groups and alternates female and male voices', () => {
    const rounds = makeRounds(groups, 8, () => 0.3)
    expect(rounds.map((r) => r.groupId)).toEqual([...groups, ...groups].map((g) => g.id))
    expect(rounds.map((r) => r.gender).slice(0, 4)).toEqual(['female', 'male', 'female', 'male'])
    expect(new Set(rounds.map((r) => r.voice)).size).toBe(8)
  })
})
