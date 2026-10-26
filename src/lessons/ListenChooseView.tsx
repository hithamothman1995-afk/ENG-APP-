import { useState } from 'react'
import type { ListenChooseLesson } from '../content/types'
import { ttsSupported } from '../audio/speech'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { NoAudioNotice, SpeedToggle, Wave } from '../components/Audio'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { attemptPoints, isSettled, MAX_ATTEMPTS } from '../logic/attempts'
import { starsFromAccuracy } from '../logic/rewards'
import { Dots, Notice, PrimaryButton, type Finish } from './common'

// اسمع جملة ثم اختر: الجملة نفسها (sentence) أو معناها بالعربي (meaning)
export function ListenChooseView({ lesson, onFinish }: { lesson: ListenChooseLesson; onFinish: Finish }) {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [points, setPoints] = useState(0)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [plays, setPlays] = useState(0)
  const { play, stop, speaking } = useSpeech()

  const item = lesson.items[index]
  const answered = picked !== null
  const ltr = lesson.mode === 'sentence'
  const correctCount = results.filter(Boolean).length

  function listen() {
    if (speaking) return stop()
    setPlays((p) => p + 1)
    void play(item.audioEn)
  }

  function choose(i: number) {
    if (answered || wrongPicks.includes(i)) return
    stop()
    const isRight = i === item.answer
    const attempt = wrongPicks.length + 1
    if (!isSettled(isRight, attempt)) {
      // خطأ أول: محاولة ثانية، ونعيد الجملة من نفس الضغطة
      setWrongPicks([...wrongPicks, i])
      setPlays((p) => p + 1)
      void play(item.audioEn)
      return
    }
    setPicked(i)
    setResults([...results, isRight])
    if (isRight) setPoints(points + attemptPoints(attempt))
  }

  function next() {
    if (index === lesson.items.length - 1) {
      onFinish(starsFromAccuracy(points, lesson.items.length))
      return
    }
    setIndex(index + 1)
    setPicked(null)
    setWrongPicks([])
    setPlays(1)
    // نشغّل الجملة التالية مباشرة من ضغطة الزر (آيفون يمنع التشغيل التلقائي بدون ضغطة)
    void play(lesson.items[index + 1].audioEn)
  }

  if (!started) {
    return (
      <>
        <section className="card intro-card">
          <span className="big-emoji" aria-hidden>👂</span>
          <p className="lead"><ArText text={lesson.introAr} /></p>
          <p className="muted">
            {lesson.items.length} أسئلة · تحتاج نجمتين على الأقل لتكمل الدرس
          </p>
        </section>
        <NoAudioNotice />
        <SpeedToggle />
        <PrimaryButton
          onClick={() => {
            setStarted(true)
            setPlays(1)
            void play(lesson.items[0].audioEn)
          }}
        >
          ابدأ الاستماع
        </PrimaryButton>
      </>
    )
  }

  return (
    <>
      <div className="quiz-top">
        <span className="pill">{index + 1} من {lesson.items.length}</span>
        <Dots results={results} total={lesson.items.length} />
        <span className="pill gold">★ {correctCount}</span>
      </div>

      <section className="card listen-card">
        <p className="lead">{lesson.mode === 'sentence' ? 'ايش الجملة اللي سمعتها؟' : 'ايش معنى الجملة اللي سمعتها؟'}</p>
        {ttsSupported ? (
          <button type="button" className={`listen-button big ${speaking ? 'speaking' : ''}`} onClick={listen} aria-label="استمع">
            <span className="listen-icon">{speaking ? <Wave /> : <Icon name={plays > 0 ? 'replay' : 'play'} size={40} />}</span>
          </button>
        ) : (
          <p className="sentence"><En>{item.audioEn}</En></p>
        )}
        {ttsSupported && <p className="muted small">{speaking ? 'يتكلم الآن…' : 'اسمع مرة ثانية لو تحتاج'}</p>}
      </section>

      <div className="options">
        {item.options.map((o, i) => {
          const tried = wrongPicks.includes(i)
          const state = !answered ? (tried ? 'wrong' : '') : i === item.answer ? 'right' : picked === i || tried ? 'wrong' : 'dim'
          return (
            <button key={i} type="button" className={`option ${state}`} disabled={answered || tried} onClick={() => choose(i)}>
              {ltr ? <En>{o}</En> : o}
            </button>
          )
        })}
      </div>

      {!answered && wrongPicks.length > 0 && (
        <p className="feedback retry" role="status">
          خطأ، اسمعها مرة ثانية وجرّب ({wrongPicks.length + 1} من {MAX_ATTEMPTS})
        </p>
      )}

      {answered && (
        <>
          <section className={`card answer-card ${picked === item.answer ? 'good' : 'retry'}`} role="status">
            <p className="feedback-title">{picked !== item.answer ? 'الإجابة الصحيحة:' : wrongPicks.length ? 'صح من المحاولة الثانية 👍' : 'صح! 👏'}</p>
            <p className="phrase-en small-phrase"><En>{item.audioEn}</En></p>
            {item.ar && <p className="muted">{item.ar}</p>}
            {item.noteAr && <Notice><ArText text={item.noteAr} /></Notice>}
          </section>
          <PrimaryButton onClick={next}>{index === lesson.items.length - 1 ? 'إنهاء' : 'التالي'}</PrimaryButton>
        </>
      )}
    </>
  )
}
