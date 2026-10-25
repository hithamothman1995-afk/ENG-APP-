import { ArText } from '../components/ArText'
import type { IntroLesson } from '../content/types'
import { Notice, PrimaryButton, type Finish } from './common'

export function IntroView({ lesson, onFinish }: { lesson: IntroLesson; onFinish: Finish }) {
  return (
    <>
      <section className="card">
        <h2>الموقف</h2>
        <p className="lead"><ArText text={lesson.situationAr} /></p>
      </section>
      <section className="card">
        <h2>ماذا ستتعلم</h2>
        <ul className="check-list">
          {lesson.goalsAr.map((g) => (
            <li key={g}><ArText text={g} /></li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>أصوات نركّز عليها</h2>
        <p><ArText text={lesson.soundsAr} /></p>
      </section>
      {lesson.noteAr && <Notice><ArText text={lesson.noteAr} /></Notice>}
      <PrimaryButton onClick={() => onFinish(3)}>فهمت، لنبدأ</PrimaryButton>
    </>
  )
}
