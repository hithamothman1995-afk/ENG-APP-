import { useEffect } from 'react'
import { LESSON_ICONS, getClass } from '../content'
import { Icon } from '../components/Icon'
import { href } from '../router'
import { setLastLesson } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'

// شاشة مؤقتة: محتوى الدروس الفعلي يُبنى في المرحلة 2
export function LessonScreen({ classId, lessonId }: { classId: string; lessonId: string }) {
  const { update } = useProgress()
  const cls = getClass(classId)
  const lesson = cls?.lessons.find((l) => l.id === lessonId)

  useEffect(() => {
    if (lesson) update((p) => setLastLesson(p, classId, lessonId))
  }, [classId, lessonId, lesson, update])

  if (!cls || !lesson) {
    return (
      <main className="screen">
        <p>هذا الدرس غير موجود.</p>
        <a className="button" href="#/map">رجوع للخريطة</a>
      </main>
    )
  }

  return (
    <main className="screen">
      <a className="back-link" href={href({ name: 'class', classId })}>
        <Icon name="back" size={20} />
        {cls.titleAr}
      </a>
      <section className="card lesson-placeholder">
        <span className="big-icon" aria-hidden>{LESSON_ICONS[lesson.type]}</span>
        <h1>{lesson.titleAr}</h1>
        <p className="muted">محتوى هذا الدرس سيُضاف في المرحلة 2.</p>
      </section>
      <a className="button" href={href({ name: 'class', classId })}>رجوع للكلاس</a>
    </main>
  )
}
