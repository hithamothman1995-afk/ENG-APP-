import { classContents, getClass, LESSON_ICONS, levels, startClassFor } from '../content'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ProgressRing'
import { WeekChart } from '../components/WeekChart'
import { classDone } from '../logic/badges'
import { dueItems } from '../logic/srs'
import { isActive, progressPercent, streakInfo, weekStats } from '../logic/stats'
import { href } from '../router'
import { loadPlacement } from '../storage/placement'
import { lessonKey } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'
import { welcomeSeen } from './WelcomeScreen'

const todayLabel = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long' })

export function Dashboard() {
  const { progress } = useProgress()
  const today = new Date()
  const week = weekStats(progress, today)
  const streakState = streakInfo(progress, today)
  const streak = streakState.days
  const due = dueItems(progress, Object.values(classContents), today).length
  const badges = levels.flatMap((l) => l.classes.filter((c) => classContents[c.id] && classDone(progress, classContents[c.id])))
  const levelOfFirst = levels.find((l) => l.classes.some((c) => classContents[c.id]))
  const percent = progressPercent(progress, Object.values(classContents))

  const last = progress.lastLesson
  const cls = getClass(last?.classId ?? startClassFor(loadPlacement()?.levelIndex ?? 0)?.classId ?? 'pharmacy')!
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

      {!welcomeSeen() ? (
        <a className="card welcome-banner" href={href({ name: 'welcome' })}>
          <span className="welcome-banner-emoji" aria-hidden>🧭</span>
          <span>
            <strong>ابدأ بالجولة الترحيبية</strong>
            <span className="muted small">ايش بنتعلم، وكيف يمشي الكلاس، وايش بتستفيد لمن تخلص</span>
          </span>
          <Icon name="chevron" size={20} />
        </a>
      ) : null}

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

      <div className="practice-row">
        <a className="card practice-card" href={href({ name: 'review' })}>
          <span className="practice-emoji" aria-hidden>🔁</span>
          <strong>مراجعة اليوم</strong>
          <span className="muted small">{due ? `${due} عبارة وكلمة تنتظرك` : 'ما فيه شي اليوم 🎉'}</span>
        </a>
        <a className="card practice-card" href={href({ name: 'ear' })}>
          <span className="practice-emoji" aria-hidden>👂</span>
          <strong>تدريب الأذن</strong>
          <span className="muted small">ship أو sheep؟</span>
        </a>
      </div>

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
            <li key={d.date} className={isActive(progress, d.date) ? 'on' : streakState.frozen.includes(d.date) ? 'frozen' : ''}>
              <span className="dot" />
              <span className="dot-label">{new Intl.DateTimeFormat('ar', { weekday: 'narrow' }).format(new Date(d.date + 'T12:00:00'))}</span>
            </li>
          ))}
        </ol>
        <p className="muted small freeze-note">
          {streakState.freezeLeftThisWeek
            ? '🧊 عندك يوم سماح هذا الأسبوع: إذا فاتك يوم واحد ما ينقطع الستريك.'
            : '🧊 استخدمت يوم السماح هذا الأسبوع، لا تفوّت يوم ثاني.'}
        </p>
      </section>

      <section className="card">
        <h2>شاراتك 🏅</h2>
        {badges.length ? (
          <div className="badge-row">
            {badges.map((c) => (
              <span key={c.id} className="badge">{c.icon} {c.titleAr}</span>
            ))}
          </div>
        ) : (
          <p className="muted">خلّص كل دروس كلاس وتاخذ شارته.</p>
        )}
        {levelOfFirst && (
          <a className="link-button" href={href({ name: 'certificate', levelId: levelOfFirst.id })}>🎓 شهادة المستوى</a>
        )}
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
