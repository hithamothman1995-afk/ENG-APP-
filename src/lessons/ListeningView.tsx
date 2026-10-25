import { useState } from 'react'
import type { ListeningLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { ExerciseRunner } from './ExerciseRunner'
import { Notice, PrimaryButton, type Finish } from './common'

export function ListeningView({ lesson, onFinish }: { lesson: ListeningLesson; onFinish: Finish }) {
  const [stage, setStage] = useState<'read' | 'questions'>('read')
  const [showAr, setShowAr] = useState(false)

  if (stage === 'questions') {
    return (
      <ExerciseRunner
        exercises={lesson.questions.map((q) => ({ kind: 'choice', ...q }))}
        onFinish={onFinish}
      />
    )
  }

  return (
    <>
      <Notice><ArText text={lesson.introAr} /></Notice>
      <button type="button" className="button" onClick={() => setShowAr(!showAr)}>
        {showAr ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
      </button>
      <ol className="dialogue">
        {lesson.dialogue.map((line, i) => (
          <li key={i} className={`bubble ${line.speaker === 'customer' ? 'me' : 'them'}`}>
            <span className="bubble-speaker">{lesson.speakers[line.speaker]}</span>
            <p>
              <En>{line.en}</En>
            </p>
            {showAr && <p className="muted">{line.ar}</p>}
          </li>
        ))}
      </ol>
      <PrimaryButton onClick={() => setStage('questions')}>إلى الأسئلة</PrimaryButton>
    </>
  )
}
