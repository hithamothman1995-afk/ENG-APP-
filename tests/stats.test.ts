import { describe, expect, it } from 'vitest'
import { dayKey, lastNDays } from '../src/logic/dates'
import { basicStreak, progressPercent, weekStats } from '../src/logic/stats'
import { addStudySeconds, emptyProgress, type Progress } from '../src/storage/progress'
import { parseRoute } from '../src/router'

const today = new Date(2026, 9, 25, 10, 0) // 25 أكتوبر 2026

function withActivity(days: Record<string, { seconds: number; lessonsCompleted: number }>): Progress {
  return { ...emptyProgress(), activity: days }
}

describe('dates', () => {
  it('builds local day keys', () => {
    expect(dayKey(today)).toBe('2026-10-25')
  })

  it('lists the last 7 days oldest first, crossing month boundaries', () => {
    expect(lastNDays(new Date(2026, 10, 2), 7)).toEqual([
      '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02',
    ])
  })
})

describe('weekStats', () => {
  it('sums minutes and lessons for the last 7 days only', () => {
    const p = withActivity({
      '2026-10-25': { seconds: 600, lessonsCompleted: 2 },
      '2026-10-19': { seconds: 120, lessonsCompleted: 1 },
      '2026-10-18': { seconds: 6000, lessonsCompleted: 9 }, // أقدم من 7 أيام
    })
    const w = weekStats(p, today)
    expect(w.days).toHaveLength(7)
    expect(w.totalMinutes).toBe(12)
    expect(w.totalLessons).toBe(3)
  })
})

describe('addStudySeconds', () => {
  it('accumulates seconds on the current day', () => {
    let p = emptyProgress()
    p = addStudySeconds(p, 15, today)
    p = addStudySeconds(p, 15, today)
    expect(p.activity['2026-10-25']).toEqual({ seconds: 30, lessonsCompleted: 0 })
  })
})

describe('progressPercent', () => {
  const cls = {
    id: 'pharmacy', levelId: 'intro', titleAr: '', titleEn: '',
    lessons: [
      { id: 'a', type: 'intro' as const, titleAr: '' },
      { id: 'b', type: 'phrases' as const, titleAr: '' },
      { id: 'c', type: 'vocab' as const, titleAr: '' },
      { id: 'd', type: 'review' as const, titleAr: '' },
    ],
  }

  it('is 0 with nothing done and rounds partial progress', () => {
    expect(progressPercent(emptyProgress(), [cls])).toBe(0)
    const p = { ...emptyProgress(), lessons: { 'pharmacy/a': { completedAt: '', stars: 3 } } }
    expect(progressPercent(p, [cls])).toBe(25)
  })

  it('handles no classes', () => {
    expect(progressPercent(emptyProgress(), [])).toBe(0)
  })
})

describe('basicStreak', () => {
  it('counts consecutive active days ending today', () => {
    const p = withActivity({
      '2026-10-25': { seconds: 60, lessonsCompleted: 0 },
      '2026-10-24': { seconds: 0, lessonsCompleted: 1 },
      '2026-10-23': { seconds: 300, lessonsCompleted: 0 },
      '2026-10-21': { seconds: 300, lessonsCompleted: 0 },
    })
    expect(basicStreak(p, today)).toBe(3)
  })

  it('keeps yesterday’s streak if today has no activity yet', () => {
    const p = withActivity({ '2026-10-24': { seconds: 120, lessonsCompleted: 0 } })
    expect(basicStreak(p, today)).toBe(1)
  })

  it('ignores days with under a minute and no lessons', () => {
    const p = withActivity({ '2026-10-25': { seconds: 30, lessonsCompleted: 0 } })
    expect(basicStreak(p, today)).toBe(0)
  })
})

describe('parseRoute', () => {
  it('maps hashes to screens', () => {
    expect(parseRoute('')).toEqual({ name: 'home' })
    expect(parseRoute('#/map')).toEqual({ name: 'map' })
    expect(parseRoute('#/class/pharmacy')).toEqual({ name: 'class', classId: 'pharmacy' })
    expect(parseRoute('#/class/pharmacy/intro')).toEqual({ name: 'lesson', classId: 'pharmacy', lessonId: 'intro' })
  })
})
