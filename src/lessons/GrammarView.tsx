import { useState } from 'react'
import type { GrammarLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { ExerciseRunner } from './ExerciseRunner'
import { PrimaryButton, type Finish } from './common'

export function GrammarView({ lesson, onFinish }: { lesson: GrammarLesson; onFinish: Finish }) {
  const [practice, setPractice] = useState(false)
  if (practice) return <ExerciseRunner exercises={lesson.exercises} onFinish={onFinish} />

  return (
    <>
      <section className="card">
        <h2><ArText text={lesson.ruleTitleAr} /></h2>
        <p><ArText text={lesson.explanationAr} /></p>
      </section>
      <ul className="rule-points">
        {lesson.points.map((p) => (
          <li key={p.en} className="card">
            <p><ArText text={p.ar} /></p>
            <p className="rule-example">
              <En>{p.en}</En>
            </p>
          </li>
        ))}
      </ul>
      <PrimaryButton onClick={() => setPractice(true)}>تمرّن</PrimaryButton>
    </>
  )
}
