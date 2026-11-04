import { useState } from 'react'
import type { Idiom, Phrase, PhrasesLesson } from '../content/types'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { ListenButton, NoAudioNotice, SpeedToggle } from '../components/Audio'
import { En } from '../components/En'
import { SpeakCheck } from '../components/SpeakCheck'
import { MIN_PHRASE_STARS, phraseLessonStars } from '../logic/rewards'
import { PrimaryButton, StepBar, type Finish } from './common'

type Item = { kind: 'phrase'; phrase: Phrase } | { kind: 'idiom'; idiom: Idiom }

// العبارات أولًا ثم التعابير الاصطلاحية. كل عنصر يحتاج نجمتين، وإلا يرجع لآخر القائمة.
export function PhrasesView({ lesson, onFinish }: { lesson: PhrasesLesson; onFinish: Finish }) {
  const items: Item[] = [
    ...lesson.phrases.map((phrase) => ({ kind: 'phrase' as const, phrase })),
    ...lesson.idioms.map((idiom) => ({ kind: 'idiom' as const, idiom })),
  ]
  const [queue, setQueue] = useState(() => items.map((_, i) => i))
  const [best, setBest] = useState<number[]>(() => items.map(() => 0))
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const { play } = useSpeech()

  const current = items[queue[0]]
  const mastered = best.filter((s) => s >= MIN_PHRASE_STARS).length

  function score(stars: number) {
    const index = queue[0]
    const nextBest = best.map((b, i) => (i === index ? Math.max(b, stars) : b))
    const rest = queue.slice(1)
    const nextQueue = stars < MIN_PHRASE_STARS ? [...rest, index] : rest
    setBest(nextBest)
    setRevealed(false)
    setShowHint(false)
    if (nextQueue.length === 0) onFinish(phraseLessonStars(nextBest))
    else setQueue(nextQueue)
  }

  if (!current) return null
  const firstIdiom = queue[0] === lesson.phrases.length && best[queue[0]] === 0

  return (
    <>
      <StepBar done={mastered} total={items.length} />
      <div className="toolbar">
        <span className="eyebrow">{current.kind === 'phrase' ? `عبارات الموقف` : `أشهر ${lesson.idioms.length} تعابير في هذا الموقف`}</span>
        <SpeedToggle />
      </div>
      <NoAudioNotice />

      {current.kind === 'phrase' ? (
        <>
          <section className="card situation-card">
            <span className="eyebrow">الموقف</span>
            <p className="lead"><ArText text={current.phrase.promptAr} /></p>
            {!revealed && (
              <>
                <p className="muted">حاول أن تقولها بالإنجليزية بنفسك قبل أن تسمعها. المحاولة حتى لو خطأ تثبّت الحفظ.</p>
                {showHint ? (
                  <p className="hint">المعنى: {current.phrase.ar}</p>
                ) : (
                  <button type="button" className="link-button" onClick={() => setShowHint(true)}>أحتاج تلميحًا</button>
                )}
              </>
            )}
          </section>
          {!revealed ? (
            <PrimaryButton
              onClick={() => {
                setRevealed(true)
                void play(current.phrase.en)
              }}
            >
              اسمع العبارة
            </PrimaryButton>
          ) : (
            <>
              <section className="card phrase-card">
                <div className="phrase-row">
                  <p className="phrase-en"><En>{current.phrase.en}</En></p>
                  <ListenButton lines={current.phrase.en} />
                </div>
                <p className="muted">{current.phrase.ar}</p>
              </section>
              {current.phrase.focus && (
                <section className="card focus-card">
                  <span className="eyebrow">
                    انتبه للنطق: <En>{current.phrase.focus.word}</En>
                    {current.phrase.focus.wrong && (
                      <>
                        {' '}وليس <En>{current.phrase.focus.wrong}</En>
                      </>
                    )}
                  </span>
                  <p><ArText text={current.phrase.focus.tipAr} /></p>
                </section>
              )}
              <SpeakCheck key={queue[0] + '-' + best[queue[0]]} target={current.phrase.en} onScore={score} />
            </>
          )}
        </>
      ) : (
        <>
          {firstIdiom && <p className="notice">أحسنت في العبارات! الآن تعابير يستخدمها أهل اللغة كثيرًا. معناها غير معنى كلماتها.</p>}
          <section className="card idiom-card">
            <span className="eyebrow">تعبير اصطلاحي</span>
            <div className="phrase-row">
              <p className="phrase-en"><En>{current.idiom.en}</En></p>
              <ListenButton lines={current.idiom.en} />
            </div>
            <p className="idiom-meaning">{current.idiom.meaningAr}</p>
            <p className="muted small">ترجمته الحرفية: {current.idiom.literalAr}</p>
            <div className="example">
              <div className="phrase-row">
                <p><En>{current.idiom.exampleEn}</En></p>
                <ListenButton lines={current.idiom.exampleEn} />
              </div>
              <p className="muted">{current.idiom.exampleAr}</p>
            </div>
          </section>
          <SpeakCheck key={queue[0] + '-' + best[queue[0]]} target={current.idiom.en} onScore={score} />
        </>
      )}
    </>
  )
}
