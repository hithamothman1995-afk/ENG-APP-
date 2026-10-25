import { classContents, getClass } from '../content'
import { En } from '../components/En'
import { WeekChart } from '../components/WeekChart'
import { basicStreak, progressPercent, weekStats } from '../logic/stats'
import { href } from '../router'
import { useProgress } from '../storage/ProgressContext'

export function Dashboard() {
  const { progress } = useProgress()
  const today = new Date()
  const week = weekStats(progress, today)
  const streak = basicStreak(progress, today)
  const percent = progressPercent(progress, Object.values(classContents))

  const last = progress.lastLesson
  const lastClass = last ? getClass(last.classId) : undefined
  const lastLesson = lastClass?.lessons.find((l) => l.id === last?.lessonId)
  const continueHref = lastLesson
    ? href({ name: 'lesson', classId: lastClass!.id, lessonId: lastLesson.id })
    : href({ name: 'class', classId: 'pharmacy' })

  return (
    <main className="screen">
      <header className="screen-header">
        <div>
          <h1>أهلًا بك 👋</h1>
          <p className="muted">خطوة صغيرة كل يوم تكفي.</p>
        </div>
        <span className="xp-badge" aria-label={`${progress.xp} نقطة`}>
          ⭐ {progress.xp} <En>XP</En>
        </span>
      </header>

      <a className="continue-card" href={continueHref}>
        <span className="continue-label">{lastLesson ? 'تابع من حيث توقفت' : 'ابدأ أول كلاس'}</span>
        <strong>
          {lastLesson ? `${lastClass!.titleAr} · ${lastLesson.titleAr}` : 'الصيدلية'}
        </strong>
        <span className="continue-button">متابعة ←</span>
      </a>

      <section className="stats-grid" aria-label="إحصائياتك">
        <div className="stat-card">
          <span className="stat-icon" aria-hidden>🔥</span>
          <span className="stat-value">{streak}</span>
          <span className="stat-label">أيام متتالية</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden>📈</span>
          <span className="stat-value">{percent}%</span>
          <span className="stat-label">نسبة التقدم</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden>⏱️</span>
          <span className="stat-value">{week.totalMinutes}</span>
          <span className="stat-label">دقيقة آخر 7 أيام</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden>✅</span>
          <span className="stat-value">{week.totalLessons}</span>
          <span className="stat-label">درس آخر 7 أيام</span>
        </div>
      </section>

      <section className="card">
        <h2>وقت التعلم هذا الأسبوع</h2>
        <WeekChart days={week.days} />
      </section>
    </main>
  )
}
