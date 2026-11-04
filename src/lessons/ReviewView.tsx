import { useState } from 'react'
import type { ClassContent } from '../content/types'
import { ArText } from '../components/ArText'
import { ListenButton } from '../components/Audio'
import { En } from '../components/En'
import { playCorrect } from '../audio/sfx'
import { starsFromAccuracy } from '../logic/rewards'
import { classItems, gradeItem, type ReviewItem } from '../logic/srs'
import { useProgress } from '../storage/ProgressContext'
import { Notice, PrimaryButton, StepBar, type Finish } from './common'

// بطاقات المراجعة: تشوف العربي، تحاول تتذكر الإنجليزي، تكشف، وتقول عرفتها أو لا.
// كل جواب يحدّث موعد البطاقة الجاي في المراجعة الذكية.
export function ReviewDeck({ items, onDone }: { items: ReviewItem[]; onDone: (known: number, total: number) => void }) {
  const { update } = useProgress()
  const [index, setIndex] = useState(0)
  const [known, setKnown] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = items[index]

  function answer(knewIt: boolean) {
    if (knewIt) playCorrect()
    update((p) => gradeItem(p, card.key, knewIt, new Date()))
    const nextKnown = known + (knewIt ? 1 : 0)
    if (index === items.length - 1) {
      onDone(nextKnown, items.length)
      return
    }
    setKnown(nextKnown)
    setIndex(index + 1)
    setRevealed(false)
  }

  return (
    <>
      <StepBar done={index} total={items.length} />
      <section className="card phrase-card">
        <span className="eyebrow">كيف تقول بالإنجليزية؟</span>
        <p className="word-ar">{card.ar}</p>
        {revealed && (
          <div className="phrase-row">
            <p className="phrase-en">
              <En>{card.en}</En>
            </p>
            <ListenButton lines={card.en} />
          </div>
        )}
      </section>
      {!revealed ? (
        <PrimaryButton onClick={() => setRevealed(true)}>اكشف</PrimaryButton>
      ) : (
        <div className="row-buttons">
          <button type="button" className="button" onClick={() => answer(false)}>لم أعرفها</button>
          <PrimaryButton onClick={() => answer(true)}>عرفتها</PrimaryButton>
        </div>
      )}
    </>
  )
}

// درس المراجعة داخل الكلاس: كل عبارات وكلمات الكلاس، والمستحق منها أول
export function ReviewView({ cls, introAr, onFinish }: { cls: ClassContent; introAr: string; onFinish: Finish }) {
  const { progress } = useProgress()
  // نرتّبها مرة وحدة عند فتح الدرس، عشان الترتيب ما يتغير وأنت تراجع
  const [items] = useState(() => {
    const srs = progress.srs ?? {}
    return [...classItems(cls)].sort((a, b) => (srs[a.key]?.due ?? '').localeCompare(srs[b.key]?.due ?? ''))
  })

  return (
    <>
      <Notice><ArText text={introAr} /></Notice>
      <ReviewDeck items={items} onDone={(known, total) => onFinish(starsFromAccuracy(known, total))} />
    </>
  )
}
