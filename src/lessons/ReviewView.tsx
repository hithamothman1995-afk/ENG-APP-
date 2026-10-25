import { useMemo, useState } from 'react'
import type { ClassContent } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { starsFromAccuracy } from '../logic/rewards'
import { Notice, PrimaryButton, StepBar, type Finish } from './common'

interface Card {
  ar: string
  en: string
}

// مؤقتًا: يراجع كل عبارات وكلمات الكلاس. في المرحلة 4 يختارها التكرار المتباعد.
export function ReviewView({ cls, introAr, onFinish }: { cls: ClassContent; introAr: string; onFinish: Finish }) {
  const cards = useMemo(() => {
    const list: Card[] = []
    for (const l of cls.lessons) {
      if (l.type === 'phrases') l.phrases.forEach((p) => list.push({ ar: p.ar, en: p.en }))
      if (l.type === 'vocab') l.words.forEach((w) => list.push({ ar: w.ar, en: w.en }))
    }
    return list
  }, [cls])

  const [index, setIndex] = useState(0)
  const [known, setKnown] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = cards[index]

  function answer(knewIt: boolean) {
    const nextKnown = known + (knewIt ? 1 : 0)
    if (index === cards.length - 1) {
      onFinish(starsFromAccuracy(nextKnown, cards.length))
      return
    }
    setKnown(nextKnown)
    setIndex(index + 1)
    setRevealed(false)
  }

  return (
    <>
      <Notice><ArText text={introAr} /></Notice>
      <StepBar done={index} total={cards.length} />
      <section className="card phrase-card">
        <span className="eyebrow">كيف تقول بالإنجليزية؟</span>
        <p className="word-ar">{card.ar}</p>
        {revealed && (
          <p className="phrase-en">
            <En>{card.en}</En>
          </p>
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
