import type { DayStat } from '../logic/stats'

const weekday = new Intl.DateTimeFormat('ar', { weekday: 'short' })

export function WeekChart({ days }: { days: DayStat[] }) {
  const max = Math.max(10, ...days.map((d) => d.minutes))
  return (
    <div className="week-chart" role="img" aria-label="دقائق التعلم في آخر 7 أيام">
      {days.map((d) => (
        <div key={d.date} className="week-bar">
          <span className="week-bar-value">{d.minutes > 0 ? d.minutes : ''}</span>
          <div className="week-bar-track">
            <div className="week-bar-fill" style={{ height: `${(d.minutes / max) * 100}%` }} />
          </div>
          <span className="week-bar-label">{weekday.format(new Date(d.date + 'T12:00:00'))}</span>
        </div>
      ))}
    </div>
  )
}
