import { useState } from 'react'
import ear from '../../content/ear-pairs.json'
import { playCorrect, playWrong } from '../audio/sfx'
import { ttsSupported } from '../audio/speech'
import { useSpeech } from '../audio/useSpeech'
import { ListenButton, NoAudioNotice, SpeedToggle } from '../components/Audio'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { makeRounds, type EarGroup } from '../logic/ear'
import { Dots, Notice, PrimaryButton } from '../lessons/common'

const groups = ear.groups as EarGroup[]
const ROUNDS = 12

// تدريب الأذن: اسمع كلمة واختر أي وحدة من الكلمتين المتقاربتين
export function EarScreen() {
  const [rounds, setRounds] = useState(() => makeRounds(groups, ROUNDS))
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<0 | 1 | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const { play } = useSpeech()

  const round = rounds[index]
  const group = groups.find((g) => g.id === round?.groupId)
  const done = index >= rounds.length

  function say(i: number, list = rounds) {
    const r = list[i]
    void play([{ text: r.pair[r.answer], voice: r.voice, gender: r.gender }])
  }

  function choose(i: 0 | 1) {
    if (picked !== null) return
    const right = i === round.answer
    if (right) playCorrect()
    else playWrong()
    setPicked(i)
    setResults([...results, right])
  }

  function next() {
    setPicked(null)
    setIndex(index + 1)
    if (index + 1 < rounds.length) say(index + 1)
  }

  function again() {
    const fresh = makeRounds(groups, ROUNDS)
    setRounds(fresh)
    setIndex(0)
    setPicked(null)
    setResults([])
    say(0, fresh)
  }

  return (
    <main className="screen">
      <a className="back-link" href="#/">
        <Icon name="back" size={20} />
        الرئيسية
      </a>
      <header>
        <h1>تدريب الأذن 👂</h1>
      </header>

      {!started ? (
        <>
          <section className="card intro-card">
            <p className="lead">{ear.introAr}</p>
            <ul className="welcome-points">
              {groups.map((g) => (
                <li key={g.id}>{g.titleAr}</li>
              ))}
            </ul>
          </section>
          {!ttsSupported && <NoAudioNotice />}
          <SpeedToggle />
          <PrimaryButton
            onClick={() => {
              setStarted(true)
              say(0)
            }}
          >
            ابدأ التدريب ({ROUNDS} كلمة)
          </PrimaryButton>
        </>
      ) : done ? (
        <section className="card intro-card">
          <span className="big-emoji" aria-hidden>🎧</span>
          <p className="lead">عرفت {results.filter(Boolean).length} من {rounds.length}</p>
          <p className="muted">كرّر التدريب كل يوم شوي، وأذنك بتتعود على الفرق.</p>
          <PrimaryButton onClick={again}>تدريب جديد</PrimaryButton>
          <a className="button" href="#/">رجوع للرئيسية</a>
        </section>
      ) : (
        <>
          <div className="quiz-top">
            <span className="pill">{index + 1} من {rounds.length}</span>
            <Dots results={results} total={rounds.length} />
            <span className="pill"><En>{round.groupId.replace('-', ' / ')}</En></span>
          </div>
          <section className="card listen-card">
            <p className="lead">أي كلمة سمعت؟</p>
            <button type="button" className="listen-button big" onClick={() => say(index)} aria-label="اسمع مرة ثانية">
              <span className="listen-icon"><Icon name="replay" size={40} /></span>
            </button>
            <p className="muted small">كل كلمة بصوت مختلف</p>
          </section>
          <div className="options two">
            {([0, 1] as const).map((i) => {
              const state = picked === null ? '' : i === round.answer ? 'right' : picked === i ? 'wrong' : 'dim'
              return (
                <button key={i} type="button" className={`option big-word ${state}`} disabled={picked !== null} onClick={() => choose(i)}>
                  <En>{round.pair[i]}</En>
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <>
              <section className={`card answer-card ${picked === round.answer ? 'good' : 'retry'}`} role="status">
                <p className="feedback-title">
                  {picked === round.answer ? 'صح! 👏' : <>الكلمة كانت <En>{round.pair[round.answer]}</En></>}
                </p>
                <div className="pair-listen">
                  {round.pair.map((w) => (
                    <span key={w} className="pair-word">
                      <En>{w}</En>
                      <ListenButton lines={[{ text: w, voice: round.voice, gender: round.gender }]} />
                    </span>
                  ))}
                </div>
                {group && <Notice>{group.tipAr}</Notice>}
              </section>
              <PrimaryButton onClick={next}>{index === rounds.length - 1 ? 'شوف النتيجة' : 'التالي'}</PrimaryButton>
            </>
          )}
        </>
      )}
    </main>
  )
}
