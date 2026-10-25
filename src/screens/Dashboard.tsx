import { classContents, getClass, LESSON_ICONS } from '../content'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ProgressRing'
import { WeekChart } from '../components/WeekChart'
import { basicStreak, isActive, progressPercent, weekStats } from '../logic/stats'
import { href } from '../router'
import { lessonKey } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'

const todayLabel = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long' })

export function Dashboard() {
  const { progress } = useProgress()
  const today = new Date()
  const week = weekStats(progress, today)
  const streak = basicStreak(progress, today)
  const percent = progressPercent(progress, Object.values(classContents))

  const last = progress.lastLesson
  const cls = getClass(last?.classId ?? 'pharmacy')!
  const lesson =
    cls.lessons.find((l) => l.id === last?.lessonId) ??
    cls.lessons.find((l) => !progress.lessons[lessonKey(cls.id, l.id)]) ??
    cls.lessons[0]
  const doneInClass = cls.lessons.filter((l) => progress.lessons[lessonKey(cls.id, l.id)]).length

  return (
    <main className="screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">{todayLabel.format(today)}</p>
          <h1>أهلًا بك</h1>
        </div>
        <span className="xp-badge" aria-label={`${progress.xp} نقطة خبرة`}>
          <Icon name="star" size={18} filled />
          <span>{progress.xp}</span>
          <En>XP</En>
        </span>
      </header>

      <a className="hero" href={href({ name: 'lesson', classId: cls.id, lessonId: lesson.id })}>
        <div className="hero-top">
          <span className="hero-icon" aria-hidden>{LESSON_ICONS[lesson.type]}</span>
          <div className="hero-text">
            <span className="hero-label">{last ? 'تابع من حيث توقفت' : 'ابدأ رحلتك'}</span>
            <strong>{lesson.titleAr}</strong>
            <span className="hero-sub">
              كلاس {cls.titleAr} · <En>{cls.titleEn}</En>
            </span>
          </div>
        </div>
        <div className="bar" aria-label={`${doneInClass} من ${cls.lessons.length} دروس`}>
          <div className="bar-fill" style={{ width: `${(doneInClass / cls.lessons.length) * 100}%` }} />
        </div>
        <span className="hero-progress">{doneInClass} من {cls.lessons.length} دروس</span>
        <span className="primary-button">
          <Icon name="play" size={20} filled />
          متابعة
        </span>
      </a>

      <section className="card streak-card" aria-label="الستريك">
        <div className="streak-head">
          <span className="streak-flame"><Icon name="flame" size={28} filled /></span>
          <div>
            <span className="big-number">{streak}</span>
            <span className="muted"> {streak === 1 ? 'يوم متتالي' : 'أيام متتالية'}</span>
          </div>
        </div>
        <ol className="week-dots">
          {week.days.map((d) => (
            <li key={d.date} className={isActive(progress, d.date) ? 'on' : ''}>
              <span className="dot" />
              <span className="dot-label">{new Intl.DateTimeFormat('ar', { weekday: 'narrow' }).format(new Date(d.date + 'T12:00:00'))}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="stats-row" aria-label="إحصائيات آخر 7 أيام">
        <div className="card stat-ring">
          <ProgressRing percent={percent} />
          <span className="stat-label">نسبة التقدم</span>
        </div>
        <div className="stat-stack">
          <div className="card stat-mini">
            <span className="stat-mini-icon"><Icon name="clock" /></span>
            <div>
              <span className="stat-value">{week.totalMinutes}</span>
              <span className="stat-label">دقيقة هذا الأسبوع</span>
            </div>
          </div>
          <div className="card stat-mini">
            <span className="stat-mini-icon"><Icon name="check" /></span>
            <div>
              <span className="stat-value">{week.totalLessons}</span>
              <span className="stat-label">درس هذا الأسبوع</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>وقت التعلم آخر 7 أيام</h2>
        <WeekChart days={week.days} />
      </section>
    </main>
  )
}
