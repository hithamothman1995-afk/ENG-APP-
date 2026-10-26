import { useEffect, useRef, useState } from 'react'
import type { ClassContent, Lesson } from '../content/types'
import { ArText } from '../components/ArText'
import { Icon } from '../components/Icon'
import { ASK_ERRORS_AR, getAsker, type AskError, type Asker } from './ask'
import { buildTurns, cleanAnswer, lessonContext, type ChatTurn } from './thomson'

// صورة تومسن (من كانفا)
const THOMSON_IMG = `${import.meta.env.BASE_URL}art/thomson.png`

const SUGGESTIONS: Record<string, string[]> = {
  'listen-choose': ['ليش الخيارات متشابهة كذا؟', 'كيف أتدرب على سماع آخر الجملة؟'],
  phrases: ['كيف أنطق حرف p بدون ما يطلع b؟', 'متى أقول under the weather؟'],
  podcast: ['ما معنى over the counter؟', 'الكلام سريع، كيف أفهمه؟'],
  vocab: ['كيف أحفظ هذي الكلمات بسرعة؟', 'وين النبرة في كلمة prescription؟'],
  grammar: ['متى أستخدم does بدل do؟', 'أعطني مثالين جديدين'],
  scene: ['ما معنى Here you go؟', 'ليش الموقف مضحك؟'],
}

function Answer({ text }: { text: string }) {
  return (
    <>
      {cleanAnswer(text)
        .split('\n')
        .filter((l) => l.trim())
        .map((l, i) => (
          <p key={i}><ArText text={l} /></p>
        ))}
    </>
  )
}

// زر عائم يفتح لوحة أسئلة تومسن داخل الدرس
export function Thomson({ cls, lesson }: { cls: ClassContent; lesson: Lesson }) {
  const [open, setOpen] = useState(false)
  const [asker, setAsker] = useState<Asker | null | undefined>(undefined)
  const [history, setHistory] = useState<ChatTurn[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState<string | null>(null)
  const [error, setError] = useState<AskError | null>(null)
  const ctl = useRef<AbortController | null>(null)
  const listEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    getAsker().then((a) => alive && setAsker(a))
    return () => {
      alive = false
    }
  }, [])

  // سؤال جديد لكل درس
  useEffect(() => {
    ctl.current?.abort()
    setHistory([])
    setStreaming(null)
    setError(null)
  }, [lesson.id])

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: 'end' })
  }, [history, streaming, open])

  async function send(question: string) {
    const q = question.trim()
    if (!q || streaming !== null) return
    if (!asker) {
      setError('unavailable')
      return
    }
    setDraft('')
    setError(null)
    const screen = (document.querySelector('.lesson-body') as HTMLElement | null)?.innerText ?? ''
    const turns = buildTurns(lessonContext(cls, lesson), screen, history, q)
    const c = new AbortController()
    ctl.current = c
    setHistory((h) => [...h, { role: 'user', content: q }])
    setStreaming('')
    try {
      const answer = await asker.ask(turns, (t) => setStreaming(t), c.signal)
      setHistory((h) => [...h, { role: 'assistant', content: answer }])
    } catch (e) {
      if (e !== 'cancelled') setError(e as AskError)
    } finally {
      setStreaming(null)
    }
  }

  const suggestions = SUGGESTIONS[lesson.type] ?? ['اشرح لي هذا الدرس بكلمات بسيطة']

  return (
    <>
      <button type="button" className="thomson-fab" onClick={() => setOpen(true)} aria-label="اسأل تومسن">
        <img className="thomson-face" src={THOMSON_IMG} alt="" aria-hidden />
        <span>اسأل تومسن</span>
      </button>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <section className="sheet" role="dialog" aria-modal="true" aria-label="تومسن" onClick={(e) => e.stopPropagation()}>
            <header className="sheet-head">
              <img className="thomson-avatar" src={THOMSON_IMG} alt="" aria-hidden />
              <div>
                <h2>تومسن</h2>
                <p className="muted small">اسألني عن أي شيء ما فهمته في هذا الدرس</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="إغلاق">✕</button>
            </header>

            <div className="chat">
              {history.length === 0 && streaming === null && (
                <div className="chat-empty">
                  <p className="muted">أمثلة:</p>
                  <div className="chips">
                    {suggestions.map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => send(s)}>
                        <ArText text={s} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {history.map((t, i) => (
                <div key={i} className={`msg ${t.role}`}>
                  {t.role === 'user' ? <p><ArText text={t.content} /></p> : <Answer text={t.content} />}
                </div>
              ))}
              {streaming !== null && (
                <div className="msg assistant">
                  {streaming ? <Answer text={streaming} /> : <p className="muted typing">تومسن يفكر…</p>}
                </div>
              )}
              {error && <p className="feedback wrong">{ASK_ERRORS_AR[error]}</p>}
              <div ref={listEnd} />
            </div>

            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault()
                void send(draft)
              }}
            >
              <input
                className="text-input"
                placeholder="اكتب سؤالك بالعربي أو بالإنجليزي"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={400}
              />
              {streaming !== null ? (
                <button type="button" className="send-button" onClick={() => ctl.current?.abort()} aria-label="إيقاف">
                  <Icon name="stop" size={22} />
                </button>
              ) : (
                <button type="submit" className="send-button" disabled={!draft.trim()} aria-label="إرسال">
                  <Icon name="send" size={22} />
                </button>
              )}
            </form>
            {asker === null && !error && <p className="muted small center">{ASK_ERRORS_AR.unavailable}</p>}
          </section>
        </div>
      )}
    </>
  )
}
