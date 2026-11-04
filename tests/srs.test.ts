import { describe, expect, it } from 'vitest'
import pharmacy from '../content/classes/pharmacy.json'
import type { ClassContent } from '../src/content/types'
import { classItems, dueItems, gradeItem } from '../src/logic/srs'
import { streakInfo } from '../src/logic/stats'
import { emptyProgress, type Progress } from '../src/storage/progress'

const cls = pharmacy as unknown as ClassContent
const now = new Date('2026-11-04T09:00:00')

function learned(): Progress {
  const p = emptyProgress()
  for (const l of cls.lessons) p.lessons[`${cls.id}/${l.id}`] = { completedAt: now.toISOString(), stars: 3 }
  return p
}

describe('smart review', () => {
  it('only reviews items from lessons you finished', () => {
    expect(dueItems(emptyProgress(), [cls], now)).toHaveLength(0)
    expect(dueItems(learned(), [cls], now).length).toBe(classItems(cls).length)
  })

  it('pushes a known item to a later day and keeps a missed one for tomorrow at most', () => {
    const key = classItems(cls)[0].key
    const knew = gradeItem(learned(), key, true, now)
    const due = new Date(knew.srs![key].due)
    expect(due.getTime()).toBeGreaterThan(now.getTime() + 20 * 3600 * 1000)
    expect(dueItems(knew, [cls], now).some((i) => i.key === key)).toBe(false)

    const missed = gradeItem(learned(), key, false, now)
    const missedDue = new Date(missed.srs![key].due).getTime()
    expect(missedDue).toBeLessThanOrEqual(now.getTime() + 26 * 3600 * 1000)
    expect(missedDue).toBeLessThan(due.getTime())
  })

  it('gives longer gaps after each correct review', () => {
    const key = classItems(cls)[1].key
    let p = gradeItem(learned(), key, true, now)
    const first = new Date(p.srs![key].due)
    p = gradeItem(p, key, true, first)
    const second = new Date(p.srs![key].due)
    expect(second.getTime() - first.getTime()).toBeGreaterThan(first.getTime() - now.getTime())
  })
})

function withDays(days: string[]): Progress {
  const p = emptyProgress()
  for (const d of days) p.activity[d] = { seconds: 300, lessonsCompleted: 1 }
  return p
}

describe('streak with a weekly freeze day', () => {
  // 2026-11-04 is a Wednesday; the week starts on Sunday 2026-11-01
  it('counts a plain run of days', () => {
    expect(streakInfo(withDays(['2026-11-02', '2026-11-03', '2026-11-04']), now).days).toBe(3)
  })

  it('covers one missed day in a week without breaking the run', () => {
    const s = streakInfo(withDays(['2026-11-01', '2026-11-02', '2026-11-04']), now)
    expect(s.days).toBe(3)
    expect(s.frozen).toEqual(['2026-11-03'])
    expect(s.freezeLeftThisWeek).toBe(false)
  })

  it('stops at the second missed day in the same week', () => {
    const s = streakInfo(withDays(['2026-11-01', '2026-11-03', '2026-11-05']), new Date('2026-11-05T09:00:00'))
    expect(s.days).toBe(2)
    expect(s.frozen).toEqual(['2026-11-04'])
  })

  it('allows one freeze per week, in different weeks', () => {
    // missed Fri 10-30 (week of 10-25) and Mon 11-02 (week of 11-01)
    const s = streakInfo(withDays(['2026-10-29', '2026-10-31', '2026-11-01', '2026-11-03', '2026-11-04']), now)
    expect(s.days).toBe(5)
    expect(s.frozen).toEqual(['2026-11-02', '2026-10-30'])
  })

  it('keeps yesterday’s run while today is not done yet', () => {
    const s = streakInfo(withDays(['2026-11-02', '2026-11-03']), now)
    expect(s.days).toBe(2)
    expect(s.freezeLeftThisWeek).toBe(true)
  })
})
