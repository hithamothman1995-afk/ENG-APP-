import { useEffect, useState } from 'react'
import { LESSON_ICONS, getClass } from '../content'
import type { ClassContent, Lesson } from '../content/types'
import { Icon } from '../components/Icon'
import { completeLesson, type CompletionResult } from '../logic/rewards'
import { href } from '../router'
import { lessonKey, setDifficulty, setLastLesson, type Difficulty } from '../storage/progress'
import { useProgress } from '../storage/ProgressContext'
import { AiChatView } from '../lessons/AiChatView'
import { GrammarView } from '../lessons/GrammarView'
import { IntroView } from '../lessons/IntroView'
import { ListenChooseView } from '../lessons/ListenChooseView'
import { PhrasesView } from '../lessons/PhrasesView'
import { PodcastView } from '../lessons/PodcastView'
import { ReviewView } from '../lessons/ReviewView'
import { SceneView } from '../lessons/SceneView'
import { VocabView } from '../lessons/VocabView'
import { Stars, type Finish } from '../lessons/common'
import { Thomson } from '../ai/Thomson'

function LessonBody({ cls, lesson, onFinish }: { cls: ClassContent; lesson: Lesson; onFinish: Finish }) {
  switch (lesson.type) {
    case 'intro':
      return <IntroView lesson={lesson} onFinish={onFinish} />
    case 'listen-choose':
      return <ListenChooseView lesson={lesson} onFinish={onFinish} />
    case 'phrases':
      return <PhrasesView lesson={lesson} onFinish={onFinish} />
    case 'podcast':
      return <PodcastView lesson={lesson} onFinish={onFinish} />
    case 'vocab':
      return <VocabView lesson={lesson} onFinish={onFinish} />
    case 'scene':
      return <SceneView lesson={lesson} onFinish={onFinish} />
    case 'grammar':
      return <GrammarView lesson={lesson} onFinish={onFinish} />
    case 'ai-chat': {
      const phrases = cls.lessons.flatMap((l) => (l.type === 'phrases' ? l.phrases : []))
      return <AiChatView lesson={lesson} phrases={phrases} onFinish={onFinish} />
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
        <section className={`card done-card ${result.passed ? 'passed' : ''}`} role="status">
          <Stars count={result.stars} size={40} />
          <h2>{result.passed ? (result.stars === 3 ? 'ممتاز! 🎉' : 'أحسنت!') : 'قربت!'}</h2>
          {result.passed ? (
            <p className="xp-gain">{result.xpGained > 0 ? `+${result.xpGained} نقطة` : 'لا نقاط جديدة هذه المرة'}</p>
          ) : (
            <p className="muted">قاعدة اللعبة: تحتاج نجمتين على الأقل حتى يكتمل الدرس. أعده، المرة الثانية دائمًا أسهل.</p>
          )}
          <div className="done-actions">
            {result.passed && next && (
              <a className="primary-button" href={href({ name: 'lesson', classId, lessonId: next.id })}>
                الدرس التالي: {next.titleAr}
              </a>
            )}
            <button
              type="button"
              className={result.passed ? 'button' : 'primary-button'}
              onClick={() => {
                setResult(null)
                setAttempt(attempt + 1)
              }}
            >
              أعد الدرس
            </button>
            <a className="button" href={href({ name: 'class', classId })}>رجوع للكلاس</a>
          </div>
          <DifficultyPicker
            value={progress.difficulty?.[lessonKey(classId, lessonId)]}
            onPick={(d) => update((p) => setDifficulty(p, classId, lessonId, d))}
          />
        </section>
      ) : (
        <div className="lesson-body">
          <LessonBody key={`${lessonId}-${attempt}`} cls={cls} lesson={lesson} onFinish={finish} />
        </div>
      )}
      <Thomson cls={cls} lesson={lesson} />
    </main>
  )
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'سهل جدًا' },
  { value: 'ok', label: 'مناسب' },
  { value: 'hard', label: 'صعب جدًا' },
]

function DifficultyPicker({ value, onPick }: { value?: Difficulty; onPick: (d: Difficulty) => void }) {
  return (
    <div className="difficulty">
      <span className="muted small">ما مدى صعوبة هذا الدرس؟</span>
      <div className="segmented" role="group" aria-label="صعوبة الدرس">
        {DIFFICULTIES.map((d) => (
          <button key={d.value} type="button" className={value === d.value ? 'on' : ''} aria-pressed={value === d.value} onClick={() => onPick(d.value)}>
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}
