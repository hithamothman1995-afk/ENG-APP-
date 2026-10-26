import { useEffect, useMemo, useState } from 'react'
import type { ClassContent, Lesson } from '../content/types'
import { pickTakeaway, takeawayPool } from '../content/takeaway'
import { ListenButton } from '../components/Audio'
import { En } from '../components/En'
import { SpeakCheck } from '../components/SpeakCheck'
import type { CompletionResult } from '../logic/rewards'
import { href } from '../router'
import type { Difficulty } from '../storage/progress'
import { Stars } from '../lessons/common'

const CONFETTI_COLORS = ['#45c4b0', '#f0b95a', '#f2895c', '#8fb8ff', '#e7e9ee']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.round(Math.random() * 100),
        delay: Math.random() * 0.4,
        dur: 1.4 + Math.random() * 1.2,
        rot: Math.round(Math.random() * 360),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }}
        />
      ))}
    </div>
  )
}

// عدّاد النقاط يطلع من صفر لين يوصل الرقم
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (to <= 0) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900)
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{n}</>
}

const FEELINGS: { value: Difficulty; emoji: string; label: string; replyAr: string }[] = [
  { value: 'easy', emoji: '😎', label: 'سهل', replyAr: 'رهيب! جرّب تعيده بدون ما تشوف النص، أو كمّل للدرس الجاي.' },
  { value: 'ok', emoji: '🙂', label: 'مناسب', replyAr: 'هذا المستوى الصح للتعلم. كمّل كذا.' },
  { value: 'hard', emoji: '😓', label: 'صعب', replyAr: 'طبيعي، الصعب هو اللي يعلّم. اسأل تومسن عن أي شي ما فهمته، وأعد الدرس بكرة.' },
]

export function DoneCard({
  cls,
  lesson,
  next,
  result,
  feeling,
  onFeeling,
  onRetry,
}: {
  cls: ClassContent
  lesson: Lesson
  next?: Lesson
  result: CompletionResult
  feeling?: Difficulty
  onFeeling: (d: Difficulty) => void
  onRetry: () => void
}) {
  const takeaway = useMemo(() => pickTakeaway(takeawayPool(cls, lesson), Math.random() * 1000), [cls, lesson])
  const [practice, setPractice] = useState<'no' | 'open' | number>('no')
  const picked = FEELINGS.find((f) => f.value === feeling)

  return (
    <section className={`card done-card ${result.passed ? 'passed' : ''}`} role="status">
      {result.passed && <Confetti />}
      <div className="done-stars">
        <Stars count={result.stars} size={44} />
      </div>
      <h2>{result.passed ? (result.stars === 3 ? 'ممتاز! 🎉' : 'أحسنت! 👏') : 'قربت! 💪'}</h2>
      {result.passed ? (
        <p className="xp-gain">{result.xpGained > 0 ? <>+<CountUp to={result.xpGained} /> نقطة</> : 'لا نقاط جديدة هذه المرة'}</p>
      ) : (
        <p className="muted">قاعدة اللعبة: تحتاج نجمتين على الأقل حتى يكتمل الدرس. أعده، المرة الثانية دائمًا أسهل.</p>
      )}

      {result.passed && takeaway && (
        <div className="takeaway">
          <span className="eyebrow">جملة تاخذها معك اليوم</span>
          <div className="phrase-row">
            <p className="phrase-en small-phrase"><En>{takeaway.en}</En></p>
            <ListenButton lines={takeaway.en} />
          </div>
          <p className="muted">{takeaway.ar}</p>
          {practice === 'no' && (
            <button type="button" className="button" onClick={() => setPractice('open')}>🎤 تقدر تقولها؟ جرّب</button>
          )}
          {practice === 'open' && <SpeakCheck target={takeaway.en} onScore={(s) => setPractice(s)} />}
          {typeof practice === 'number' && (
            <p className="feedback right">{practice >= 2 ? 'برافو! صارت جملتك 🌟' : 'حلو إنك جربت، رددها اليوم مرتين وبتثبت.'}</p>
          )}
        </div>
      )}

      <div className="difficulty">
        <span className="muted small">كيف كان الدرس؟</span>
        <div className="feelings" role="group" aria-label="صعوبة الدرس">
          {FEELINGS.map((f) => (
            <button key={f.value} type="button" className={feeling === f.value ? 'on' : ''} aria-pressed={feeling === f.value} onClick={() => onFeeling(f.value)}>
              <span className="feeling-emoji" aria-hidden>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
        {picked && <p className="muted small">{picked.replyAr}</p>}
      </div>

      <div className="done-actions">
        {result.passed && next && (
          <a className="primary-button" href={href({ name: 'lesson', classId: cls.id, lessonId: next.id })}>
            الدرس التالي: {next.titleAr}
          </a>
        )}
        <button type="button" className={result.passed ? 'button' : 'primary-button'} onClick={onRetry}>
          أعد الدرس
        </button>
        <a className="button" href={href({ name: 'class', classId: cls.id })}>رجوع للكلاس</a>
      </div>
    </section>
  )
}
