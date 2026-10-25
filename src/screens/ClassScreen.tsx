import { LESSON_ICONS, findLevelOfClass, getClass } from '../content'
import { En } from '../components/En'
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
  const nextIndex = cls.lessons.findIndex((l) => !progress.lessons[lessonKey(cls.id, l.id)])

  return (
    <main className="screen">
      <a className="back-link" href="#/map">→ المستويات</a>
      <header className="class-header">
        <span className="muted">{level?.titleAr}</span>
        <h1>{cls.titleAr}</h1>
        <En>{cls.titleEn}</En>
      </header>

      <ol className="lesson-list">
        {cls.lessons.map((l, i) => {
          const record = progress.lessons[lessonKey(cls.id, l.id)]
          const isNext = i === nextIndex
          return (
            <li key={l.id}>
              <a
                className={`lesson-row ${record ? 'done' : ''} ${isNext ? 'next' : ''}`}
                href={href({ name: 'lesson', classId: cls.id, lessonId: l.id })}
              >
                <span className="lesson-step">{i + 1}</span>
                <span className="lesson-icon" aria-hidden>{LESSON_ICONS[l.type]}</span>
                <span className="lesson-title">{l.titleAr}</span>
                <span className="lesson-stars" aria-label={record ? `${record.stars} نجوم` : 'لم يكتمل'}>
                  {record ? '★'.repeat(record.stars) + '☆'.repeat(3 - record.stars) : isNext ? 'ابدأ' : ''}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
