import { useEffect, useState } from 'react'
import { LESSON_ICONS, getClass } from '../content'
import type { ClassContent, Lesson } from '../content/types'
import { Icon } from '../components/Icon'
import { completeLesson, type CompletionResult } from '../logic/rewards'
import { href } from '../router'
import { setLastLesson } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'
import { AiChatView } from '../lessons/AiChatView'
import { ExerciseRunner } from '../lessons/ExerciseRunner'
import { GrammarView } from '../lessons/GrammarView'
import { IdiomView } from '../lessons/IdiomView'
import { IntroView } from '../lessons/IntroView'
import { ListeningView } from '../lessons/ListeningView'
import { PhrasesView } from '../lessons/PhrasesView'
import { ReviewView } from '../lessons/ReviewView'
import { VocabView } from '../lessons/VocabView'
import { Stars, type Finish } from '../lessons/common'

function LessonBody({ cls, lesson, onFinish }: { cls: ClassContent; lesson: Lesson; onFinish: Finish }) {
  switch (lesson.type) {
    case 'intro':
      return <IntroView lesson={lesson} onFinish={onFinish} />
    case 'phrases':
      return <PhrasesView lesson={lesson} onFinish={onFinish} />
    case 'vocab':
      return <VocabView lesson={lesson} onFinish={onFinish} />
    case 'vocab-practice':
      return <ExerciseRunner exercises={lesson.exercises} onFinish={onFinish} />
    case 'idiom':
      return <IdiomView lesson={lesson} onFinish={onFinish} />
    case 'listening':
      return <ListeningView lesson={lesson} onFinish={onFinish} />
    case 'grammar':
      return <GrammarView lesson={lesson} onFinish={onFinish} />
    case 'ai-chat': {
      const phrases = cls.lessons.flatMap((l) => (l.type === 'phrases' ? l.phrases : []))
      return <AiChatView lesson={lesson} phrases={phrases} />
    }
    case 'review':
      return <ReviewView cls={cls} introAr={lesson.introAr} onFinish={onFinish} />
  }
}

export function LessonScreen({ classId, lessonId }: { classId: string; lessonId: string }) {
  const { progress, update } = useProgress()
  const [result, setResult] = useState<CompletionResult | null>(null)
  const [attempt, setAttempt] = useState(0)
  const cls = getClass(classId)
  const index = cls?.lessons.findIndex((l) => l.id === lessonId) ?? -1
  const lesson = cls?.lessons[index]
  const next = cls?.lessons[index + 1]

  useEffect(() => {
    setResult(null)
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

  const finish: Finish = (stars) => {
    const r = completeLesson(progress, classId, lessonId, stars, next?.id ?? null)
    update(() => r.progress)
    setResult(r)
    window.scrollTo(0, 0)
  }

  return (
    <main className="screen">
      <a className="back-link" href={href({ name: 'class', classId })}>
        <Icon name="back" size={20} />
        {cls.titleAr}
      </a>
      <header className="lesson-header">
        <span className="lesson-header-icon" aria-hidden>{LESSON_ICONS[lesson.type]}</span>
        <div>
          <span className="eyebrow">الدرس {index + 1} من {cls.lessons.length}</span>
          <h1>{lesson.titleAr}</h1>
        </div>
      </header>

      {result ? (
        <section className="card done-card" role="status">
          <Stars count={result.stars} size={40} />
          <h2>{result.stars >= 2 ? 'أحسنت!' : 'انتهى الدرس'}</h2>
          <p className="xp-gain">
            {result.xpGained > 0 ? `+${result.xpGained} نقطة` : 'لا نقاط جديدة هذه المرة'}
          </p>
          {result.stars < 2 && <p className="muted">أعد الدرس لتحصل على نجوم أكثر.</p>}
          <div className="done-actions">
            {next && (
              <a className="primary-button" href={href({ name: 'lesson', classId, lessonId: next.id })}>
                الدرس التالي: {next.titleAr}
              </a>
            )}
            <button
              type="button"
              className="button"
              onClick={() => {
                setResult(null)
                setAttempt(attempt + 1)
              }}
            >
              أعد الدرس
            </button>
            <a className="button" href={href({ name: 'class', classId })}>رجوع للكلاس</a>
          </div>
        </section>
      ) : (
        <LessonBody key={`${lessonId}-${attempt}`} cls={cls} lesson={lesson} onFinish={finish} />
      )}
    </main>
  )
}
