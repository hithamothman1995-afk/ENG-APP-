import { useMemo, useState } from 'react'
import type { VocabLesson } from '../content/types'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { ListenButton } from '../components/Audio'
import { En } from '../components/En'
import { starsFromAccuracy } from '../logic/rewards'
import { shuffled } from '../logic/shuffle'
import { Dots, PrimaryButton, type Finish } from './common'

// كلمة بالعربي ← اختر الإنجليزي، ثم بطاقة الكلمة: النطق والنبرة ومثال
export function VocabView({ lesson, onFinish }: { lesson: VocabLesson; onFinish: Finish }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const { play } = useSpeech()

  const word = lesson.words[index]
  const options = useMemo(() => shuffled([word.en, ...word.distractors], word.id), [word])
  const answered = picked !== null
  const last = index === lesson.words.length - 1

  function choose(o: string) {
    if (answered) return
    setPicked(o)
    setResults([...results, o === word.en])
    void play(word.en)
  }

  return (
    <>
      <div className="quiz-top">
        <span className="pill">{index + 1} من {lesson.words.length}</span>
        <Dots results={results} total={lesson.words.length} />
        <span className="pill gold">★ {results.filter(Boolean).length}</span>
      </div>
      <section className="card prompt-card">
        <span className="eyebrow">كيف تقولها بالإنجليزي؟</span>
        <p className="word-ar big">{word.ar}</p>
      </section>
      <div className="options">
        {options.map((o) => {
          const state = !answered ? '' : o === word.en ? 'right' : picked === o ? 'wrong' : 'dim'
          return (
            <button key={o} type="button" className={`option ${state}`} disabled={answered} onClick={() => choose(o)}>
              <En>{o}</En>
            </button>
          )
        })}
      </div>

      {answered && (
        <>
          <section className="card word-card">
            <div className="phrase-row">
              <p className="word-en"><En>{word.en}</En></p>
              <ListenButton lines={word.en} />
            </div>
            <p className="word-meta">
              <En>{word.ipa}</En>
              <span aria-hidden> · </span>
              <span>النبرة: <En>{word.stress}</En></span>
            </p>
            {word.noteAr && <p className="hint"><ArText text={word.noteAr} /></p>}
            <div className="example">
              <div className="phrase-row">
                <p><En>{word.exampleEn}</En></p>
                <ListenButton lines={word.exampleEn} />
              </div>
              <p className="muted">{word.exampleAr}</p>
            </div>
          </section>
          <PrimaryButton
            onClick={() => {
              if (last) {
                onFinish(starsFromAccuracy(results.filter(Boolean).length, lesson.words.length))
                return
              }
              setIndex(index + 1)
              setPicked(null)
            }}
          >
            {last ? 'إنهاء' : 'التالي'}
          </PrimaryButton>
        </>
      )}
    </>
  )
}
