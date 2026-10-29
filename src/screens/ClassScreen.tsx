import { LESSON_ICONS, findLevelOfClass, getClass, levels } from '../content'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { href } from '../router'
import { lessonKey } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'

export function ClassScreen({ classId }: { classId: string }) {
  const { progress } = useProgress()
  const cls = getClass(classId)
  if (!cls) {
    return (
      <main className="screen">
        <p>هذا الكلاس غير موجود أو ما زال مقفلًا.</p>
        <a className="button" href="#/map">رجوع للخريطة</a>
      </main>
    )
  }
  const level = findLevelOfClass(classId)
  const levelNumber = level ? levels.indexOf(level) + 1 : 0
  const icon = level?.classes.find((c) => c.id === classId)?.icon
  const nextIndex = cls.lessons.findIndex((l) => !progress.lessons[lessonKey(cls.id, l.id)])
  const done = cls.lessons.filter((l) => progress.lessons[lessonKey(cls.id, l.id)]).length

  return (
    <main className="screen">
      <a className="back-link" href="#/map">
        <Icon name="back" size={20} />
        المستويات
      </a>
      <header className="class-hero">
        {cls.cover ? (
          <img className="hero-art" src={`${import.meta.env.BASE_URL}${cls.cover}`} alt="" />
        ) : (
          <span className="class-hero-icon" aria-hidden>{icon}</span>
        )}
        <span className="eyebrow">المستوى {levelNumber} · {level?.titleAr}</span>
        <h1>{cls.titleAr}</h1>
        <En>{cls.titleEn}</En>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(done / cls.lessons.length) * 100}%` }} />
        </div>
        <span className="muted small">{done} من {cls.lessons.length} دروس</span>
      </header>

      <ol className="lesson-list">
        {cls.lessons.map((l, i) => {
          const record = progress.lessons[lessonKey(cls.id, l.id)]
          const isNext = i === nextIndex
          return (
            <li key={l.id} className={`lesson ${record ? 'done' : ''} ${isNext ? 'next' : ''}`}>
              <a className="lesson-row" href={href({ name: 'lesson', classId: cls.id, lessonId: l.id })}>
                <span className="lesson-step">{record ? <Icon name="check" size={18} /> : i + 1}</span>
                <span className="lesson-icon" aria-hidden>{LESSON_ICONS[l.type]}</span>
                <span className="lesson-title">{l.titleAr}</span>
                {record ? (
                  <span className="lesson-stars" aria-label={`${record.stars} من 3 نجوم`}>
                    {[0, 1, 2].map((s) => (
                      <Icon key={s} name="star" size={16} filled={s < record.stars} />
                    ))}
                  </span>
                ) : isNext ? (
                  <span className="lesson-start">ابدأ</span>
                ) : null}
              </a>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
