import { useEffect, useRef, useState } from 'react'
import type { AiChatLesson, Phrase } from '../content/types'
import { recognitionSupported, listenOnce, LISTEN_ERRORS_AR, type ListenError } from '../audio/recognition'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { SpeedToggle } from '../components/Audio'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { ASK_ERRORS_AR, getAsker, type AskError, type Asker } from '../ai/ask'
import {
  buildFeedbackTurns,
  buildRoleTurns,
  chatStars,
  MAX_LEARNER_TURNS,
  parseRoleLine,
  usedPhraseIds,
} from '../ai/pharmacist'
import { cleanAnswer, type ChatTurn } from '../ai/thomson'
import { Notice, PrimaryButton, type Finish } from './common'

const ROLE_VOICE = 1

// محادثة صوتية مع شخصية الموقف: هو يتكلم، وأنت ترد بصوتك أو بالكتابة، وفي الآخر ملخص بأهم الأخطاء
export function AiChatView({ lesson, phrases, onFinish }: { lesson: AiChatLesson; phrases: Phrase[]; onFinish: Finish }) {
  const targets = phrases.filter((p) => lesson.targetPhraseIds.includes(p.id))
  const [asker, setAsker] = useState<Asker | null | undefined>(undefined)
  const [stage, setStage] = useState<'intro' | 'chat' | 'feedback'>('intro')
  const [chat, setChat] = useState<ChatTurn[]>([])
  const [shownAr, setShownAr] = useState<number[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState<string | null>(null)
  const [error, setError] = useState<AskError | null>(null)
  const [micError, setMicError] = useState<ListenError | null>(null)
  const [listening, setListening] = useState<(() => void) | null>(null)
  const [ended, setEnded] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const ctl = useRef<AbortController | null>(null)
  const listEnd = useRef<HTMLDivElement>(null)
  const { play, stop } = useSpeech()

  useEffect(() => {
    let alive = true
    getAsker().then((a) => alive && setAsker(a))
    return () => {
      alive = false
      ctl.current?.abort()
    }
  }, [])

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [chat, streaming, feedback])

  const learnerLines = chat.filter((t) => t.role === 'user').map((t) => t.content)
  const used = usedPhraseIds(targets, learnerLines)
  const opening = `EN: ${lesson.openingEn}\nAR: ${lesson.openingAr}`
  const shown: ChatTurn[] = [{ role: 'assistant', content: opening }, ...chat]

  function say(raw: string) {
    void play([{ text: parseRoleLine(raw).en, voice: ROLE_VOICE }])
  }

  async function run(turns: ChatTurn[], onDone: (text: string) => void) {
    if (!asker) return
    const c = new AbortController()
    ctl.current = c
    setError(null)
    setStreaming('')
    try {
      onDone(await asker.ask(turns, (t) => setStreaming(t), c.signal))
    } catch (e) {
      if (e !== 'cancelled') setError(e as AskError)
    } finally {
      setStreaming(null)
    }
  }

  async function send(text: string) {
    const said = text.trim()
    if (!said || streaming !== null || ended) return
    stop()
    setDraft('')
    setMicError(null)
    const next: ChatTurn[] = [...chat, { role: 'user', content: said }]
    setChat(next)
    await run(buildRoleTurns(lesson, targets, next), (reply) => {
      const line = parseRoleLine(reply)
      setChat((c) => [...c, { role: 'assistant', content: reply }])
      say(reply)
      if (line.end || next.filter((t) => t.role === 'user').length >= MAX_LEARNER_TURNS) setEnded(true)
    })
  }

  function mic() {
    if (listening) return listening()
    stop()
    setMicError(null)
    const l = listenOnce(12000)
    setListening(() => l.stop)
    l.result
      .then((alts) => setDraft(alts[0] ?? ''))
      .catch((e: ListenError) => setMicError(e))
      .finally(() => setListening(null))
  }

  async function finish() {
    stop()
    ctl.current?.abort()
    setStage('feedback')
    await run(buildFeedbackTurns(lesson, chat), (text) => setFeedback(text))
  }

  if (stage === 'intro') {
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
                <p><En>{p.en}</En></p>
                <p className="muted">{p.ar}</p>
              </li>
            ))}
          </ul>
        </section>
        {asker === null ? (
          <Notice>هذا الدرس يشتغل حاليًا داخل رابط التجربة فقط، وبيتفعّل في التطبيق قريبًا.</Notice>
        ) : (
          <>
            <SpeedToggle />
            <PrimaryButton
              disabled={asker === undefined}
              onClick={() => {
                setStage('chat')
                say(opening) // من نفس الضغطة عشان آيفون يسمح بالصوت
              }}
            >
              ابدأ المحادثة
            </PrimaryButton>
          </>
        )}
      </>
    )
  }

  const learnerTurns = learnerLines.length

  return (
    <>
      <div className="phrase-goals" aria-label="العبارات المطلوبة">
        {targets.map((p) => (
          <span key={p.id} className={`goal ${used.includes(p.id) ? 'done' : ''}`}>
            {used.includes(p.id) ? '✓ ' : ''}
            <En>{p.en}</En>
          </span>
        ))}
      </div>

      <div className="role-chat">
        {shown.map((t, i) => {
          if (t.role === 'user') {
            return (
              <div key={i} className="msg user" lang="en" dir="ltr">
                <p>{t.content}</p>
              </div>
            )
          }
          const line = parseRoleLine(t.content)
          const arOpen = shownAr.includes(i)
          return (
            <div key={i} className="msg assistant role">
              <span className="role-avatar" aria-hidden>🧑‍⚕️</span>
              <p className="role-en"><En>{line.en}</En></p>
              {arOpen && line.ar && <p className="muted">{line.ar}</p>}
              <div className="msg-actions">
                <button type="button" className="chip" onClick={() => say(t.content)}>
                  <Icon name="volume" size={16} /> اسمع
                </button>
                {line.ar && (
                  <button type="button" className="chip" onClick={() => setShownAr(arOpen ? shownAr.filter((x) => x !== i) : [...shownAr, i])}>
                    {arOpen ? 'أخفِ الترجمة' : 'الترجمة'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {streaming !== null && stage === 'chat' && (
          <div className="msg assistant role">
            <span className="role-avatar" aria-hidden>🧑‍⚕️</span>
            <p className="muted typing">{lesson.roleAr} يكتب…</p>
          </div>
        )}
        <div ref={listEnd} />
      </div>

      {error && <p className="feedback wrong">{ASK_ERRORS_AR[error]}</p>}

      {stage === 'chat' && !ended && (
        <>
          {micError && <p className="feedback wrong">{LISTEN_ERRORS_AR[micError]}</p>}
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault()
              void send(draft)
            }}
          >
            {recognitionSupported && (
              <button
                type="button"
                className={`send-button mic ${listening ? 'listening' : ''}`}
                onClick={mic}
                disabled={streaming !== null}
                aria-label={listening ? 'إيقاف التسجيل' : 'تكلّم'}
              >
                <Icon name={listening ? 'stop' : 'mic'} size={22} />
              </button>
            )}
            <input
              className="text-input"
              dir="ltr"
              lang="en"
              placeholder={listening ? 'أسمعك…' : 'Type in English…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
            />
            <button type="submit" className="send-button" disabled={!draft.trim() || streaming !== null} aria-label="إرسال">
              <Icon name="send" size={22} />
            </button>
          </form>
          <p className="muted small center">
            {recognitionSupported ? 'اضغط المايك وتكلّم، راجع الكلام ثم أرسله. أو اكتب.' : 'متصفحك ما يدعم المايك، اكتب ردك.'}
          </p>
        </>
      )}

      {stage === 'chat' && (ended || learnerTurns >= 3) && (
        <PrimaryButton disabled={streaming !== null} onClick={finish}>
          {ended ? 'انتهت المحادثة، شوف ملخصك' : 'أنهِ المحادثة وشوف ملخصك'}
        </PrimaryButton>
      )}

      {stage === 'feedback' && (
        <section className="card feedback-card">
          <h2>ملخص المحادثة</h2>
          <p className="muted">
            استخدمت {used.length} من {targets.length} عبارات · تكلّمت {learnerTurns} مرات
          </p>
          {feedback === null ? (
            streaming !== null ? <p className="muted typing">نجهّز ملخصك…</p> : null
          ) : (
            cleanAnswer(feedback)
              .split('\n')
              .filter((l) => l.trim())
              .map((l, i) => <p key={i}><ArText text={l} /></p>)
          )}
        </section>
      )}

      {stage === 'feedback' && (feedback !== null || error) && (
        <PrimaryButton onClick={() => onFinish(chatStars(learnerTurns, used.length, targets.length))}>أنهِ الدرس</PrimaryButton>
      )}
    </>
  )
}
