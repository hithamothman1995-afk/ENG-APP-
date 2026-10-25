import type { AiChatLesson, Phrase } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { Notice } from './common'

export function AiChatView({ lesson, phrases }: { lesson: AiChatLesson; phrases: Phrase[] }) {
  const targets = phrases.filter((p) => lesson.targetPhraseIds.includes(p.id))
  return (
    <>
      <section className="card">
        <h2>دورك في المحادثة</h2>
        <p><ArText text={lesson.scenarioAr} /></p>
      </section>
      <section className="card">
        <h2>حاول أن تستخدم هذه العبارات</h2>
        <ul className="example-list">
          {targets.map((p) => (
            <li key={p.id}>
              <p>
                <En>{p.en}</En>
              </p>
              <p className="muted">{p.ar}</p>
            </li>
          ))}
        </ul>
      </section>
      <Notice>
        المحادثة مع {lesson.roleAr} تُفعّل في المرحلة 6، لأنها تحتاج خادمًا صغيرًا ومفتاح API لن نضيفه إلا بموافقتك.
      </Notice>
    </>
  )
}
