import { useState } from 'react'
import type { VocabLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { PrimaryButton, StepBar, type Finish } from './common'

export function VocabView({ lesson, onFinish }: { lesson: VocabLesson; onFinish: Finish }) {
  const [index, setIndex] = useState(0)
  const word = lesson.words[index]
  const last = index === lesson.words.length - 1

  return (
    <>
      <StepBar done={index + 1} total={lesson.words.length} />
      <section className="card word-card">
        <p className="word-en">
          <En>{word.en}</En>
        </p>
        <p className="word-meta">
          <En>{word.ipa}</En>
          <span aria-hidden> · </span>
          <span>
            النبرة: <En>{word.stress}</En>
          </span>
        </p>
        <p className="word-ar">{word.ar}</p>
        {word.noteAr && <p className="hint"><ArText text={word.noteAr} /></p>}
        <div className="example">
          <p>
            <En>{word.exampleEn}</En>
          </p>
          <p className="muted">{word.exampleAr}</p>
        </div>
      </section>
      <div className="row-buttons">
        <button type="button" className="button" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          السابقة
        </button>
        <PrimaryButton onClick={() => (last ? onFinish(3) : setIndex(index + 1))}>
          {last ? 'أنهيت الكلمات' : 'التالية'}
        </PrimaryButton>
      </div>
    </>
  )
}
