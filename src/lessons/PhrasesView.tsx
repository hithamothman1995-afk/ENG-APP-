import { useState } from 'react'
import type { PhrasesLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { MIN_PHRASE_STARS, phraseLessonStars } from '../logic/rewards'
import { Notice, PrimaryButton, StepBar, type Finish } from './common'

const RATINGS = [
  { stars: 3, label: 'قلتها صحيحة' },
  { stars: 2, label: 'قريبة منها' },
  { stars: 1, label: 'لم أتذكرها' },
]

export function PhrasesView({ lesson, onFinish }: { lesson: PhrasesLesson; onFinish: Finish }) {
  const phrases = lesson.phrases
  const [queue, setQueue] = useState(() => phrases.map((_, i) => i))
  const [best, setBest] = useState<number[]>(() => phrases.map(() => 0))
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const current = phrases[queue[0]]
  const mastered = best.filter((s) => s >= MIN_PHRASE_STARS).length

  function rate(stars: number) {
    const index = queue[0]
    const nextBest = best.map((b, i) => (i === index ? Math.max(b, stars) : b))
    // العبارة التي لم تصل لنجمتين ترجع لآخر القائمة
    const rest = queue.slice(1)
    const nextQueue = stars < MIN_PHRASE_STARS ? [...rest, index] : rest
    setBest(nextBest)
    setRevealed(false)
    setShowHint(false)
    if (nextQueue.length === 0) onFinish(phraseLessonStars(nextBest))
    else setQueue(nextQueue)
  }

  if (!current) return null

  return (
    <>
      <StepBar done={mastered} total={phrases.length} />
      <section className="card situation-card">
        <span className="eyebrow">الموقف</span>
        <p className="lead"><ArText text={current.promptAr} /></p>
        {!revealed && (
          <>
            <p className="muted">حاول أن تقول العبارة بالإنجليزية بصوت عالٍ قبل أن تكشفها.</p>
            {showHint ? (
              <p className="hint">المعنى: {current.ar}</p>
            ) : (
              <button type="button" className="link-button" onClick={() => setShowHint(true)}>
                أحتاج تلميحًا
              </button>
            )}
          </>
        )}
      </section>

      {!revealed ? (
        <PrimaryButton onClick={() => setRevealed(true)}>اكشف العبارة</PrimaryButton>
      ) : (
        <>
          <section className="card phrase-card">
            <p className="phrase-en">
              <En>{current.en}</En>
            </p>
            <p className="muted">{current.ar}</p>
          </section>
          {current.focus && (
            <section className="card focus-card">
              <span className="eyebrow">
                انتبه للنطق: <En>{current.focus.word}</En>
                {current.focus.wrong && (
                  <>
                    {' '}وليس <En>{current.focus.wrong}</En>
                  </>
                )}
              </span>
              <p><ArText text={current.focus.tipAr} /></p>
            </section>
          )}
          <p className="muted">كرر العبارة بصوتك مرتين، ثم قيّم نفسك:</p>
          <div className="rating-buttons">
            {RATINGS.map((r) => (
              <button key={r.stars} type="button" className="button" onClick={() => rate(r.stars)}>
                {'★'.repeat(r.stars)} {r.label}
              </button>
            ))}
          </div>
          <Notice>حاليًا تقيّم نفسك. في المرحلة القادمة سيسمعك التطبيق عبر الميكروفون ويعطيك النجوم.</Notice>
        </>
      )}
    </>
  )
}
