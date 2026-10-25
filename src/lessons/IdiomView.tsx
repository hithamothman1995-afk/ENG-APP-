import type { IdiomLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { PrimaryButton, type Finish } from './common'

export function IdiomView({ lesson, onFinish }: { lesson: IdiomLesson; onFinish: Finish }) {
  return (
    <>
      <section className="card phrase-card">
        <p className="phrase-en">
          <En>{lesson.en}</En>
        </p>
        <p className="word-ar">{lesson.ar}</p>
        <p className="muted"><ArText text={lesson.literalAr} /></p>
      </section>
      <section className="card">
        <h2>متى نقولها؟</h2>
        <p><ArText text={lesson.meaningAr} /></p>
      </section>
      <section className="card">
        <h2>أمثلة</h2>
        <ul className="example-list">
          {lesson.examples.map((e) => (
            <li key={e.en}>
              <p>
                <En>{e.en}</En>
              </p>
              <p className="muted">{e.ar}</p>
            </li>
          ))}
        </ul>
      </section>
      <PrimaryButton onClick={() => onFinish(3)}>حفظتها</PrimaryButton>
    </>
  )
}
