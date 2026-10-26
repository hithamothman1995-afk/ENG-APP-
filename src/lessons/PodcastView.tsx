import { useState } from 'react'
import type { PodcastLesson } from '../content/types'
import { estimateSeconds, ttsSupported } from '../audio/speech'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { NoAudioNotice, SpeedToggle, Wave } from '../components/Audio'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { starsFromAccuracy } from '../logic/rewards'
import { ExerciseRunner } from './ExerciseRunner'
import { PrimaryButton, type Finish } from './common'

const TAGS = { term: 'مصطلح جديد', idiom: 'تعبير اصطلاحي', general: 'فهم عام' }

function minutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60))
  return m === 1 ? 'دقيقة' : m === 2 ? 'دقيقتان' : `${m} دقائق`
}

// بودكاست مقسّم لأجزاء: تسمع جزءًا (حوالي دقيقتين) ثم تجيب 5 أسئلة عنه، ثم تكمل
export function PodcastView({ lesson, onFinish }: { lesson: PodcastLesson; onFinish: Finish }) {
  const [seg, setSeg] = useState(0)
  const [stage, setStage] = useState<'listen' | 'questions' | 'recap'>('listen')
  const [heardAll, setHeardAll] = useState(false)
  const [resumeAt, setResumeAt] = useState(0)
  const [showText, setShowText] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [segScore, setSegScore] = useState(0)
  const { play, stop, speaking, lineIndex, rate } = useSpeech()

  const segment = lesson.segments[seg]
  const lines = segment.lines.map((l) => ({ text: l.en, voice: lesson.characters[l.speaker].voice }))
  const totalSeconds = lesson.segments.reduce((sum, s) => sum + s.lines.reduce((a, l) => a + estimateSeconds(l.en, rate) + 0.35, 0), 0)
  const segSeconds = segment.lines.reduce((a, l) => a + estimateSeconds(l.en, rate) + 0.35, 0)
  const current = speaking ? lineIndex : resumeAt
  const last = seg === lesson.segments.length - 1

  async function toggle() {
    if (speaking) {
      setResumeAt(Math.max(0, lineIndex))
      stop()
      return
    }
    const from = resumeAt >= lines.length ? 0 : resumeAt
    const done = await play(lines, { from })
    if (done) {
      setHeardAll(true)
      setResumeAt(0)
    }
  }

  if (stage === 'questions') {
    return (
      <>
        <p className="eyebrow">أسئلة الجزء {seg + 1} من {lesson.segments.length}</p>
        <ExerciseRunner
          exercises={segment.questions.map((q) => ({ kind: 'choice', ...q, labelAr: TAGS[q.tag] }))}
          onDone={(correct, total) => {
            setScore((s) => ({ correct: s.correct + correct, total: s.total + total }))
            setSegScore(correct)
            setStage('recap')
            window.scrollTo(0, 0)
          }}
        />
      </>
    )
  }

  if (stage === 'recap') {
    return (
      <>
        <section className="card done-card">
          <p className="feedback-title">الجزء {seg + 1}: {segScore} من {segment.questions.length} صحيحة</p>
          <div className="progress-dots">
            {lesson.segments.map((_, i) => (
              <i key={i} className={i <= seg ? 'on' : ''} />
            ))}
          </div>
        </section>
        <section className="card">
          <span className="eyebrow">مصطلحات هذا الجزء</span>
          <ul className="term-list">
            {segment.newTerms.map((t) => (
              <li key={t.en}>
                <En>{t.en}</En>
                <span className="muted">{t.ar}</span>
              </li>
            ))}
          </ul>
        </section>
        <PrimaryButton
          onClick={() => {
            if (last) {
              onFinish(starsFromAccuracy(score.correct, score.total))
              return
            }
            setSeg(seg + 1)
            setStage('listen')
            setHeardAll(false)
            setResumeAt(0)
            window.scrollTo(0, 0)
          }}
        >
          {last ? 'إنهاء البودكاست' : `أكمل الاستماع: الجزء ${seg + 2}`}
        </PrimaryButton>
      </>
    )
  }

  const speaker = segment.lines[Math.max(0, Math.min(current, segment.lines.length - 1))]?.speaker

  return (
    <>
      {seg === 0 && (
        <section className="card intro-card">
          <span className="eyebrow"><En>{lesson.titleEn}</En> · حوالي {minutes(totalSeconds)}</span>
          <p><ArText text={lesson.introAr} /></p>
        </section>
      )}
      <NoAudioNotice />

      <section className="card player-card">
        <div className="player-head">
          <span className="pill">الجزء {seg + 1} من {lesson.segments.length}</span>
          <span className="muted small">حوالي {minutes(segSeconds)}</span>
        </div>
        <h2><ArText text={segment.titleAr} /></h2>
        <div className="speakers">
          {Object.entries(lesson.characters).map(([id, c]) => (
            <span key={id} className={`speaker ${speaking && speaker === id ? 'talking' : ''}`}>
              <span className="avatar" aria-hidden>{c.emoji}</span>
              {c.nameAr}
            </span>
          ))}
        </div>
        {ttsSupported && (
          <button type="button" className={`listen-button big ${speaking ? 'speaking' : ''}`} onClick={toggle} aria-label={speaking ? 'إيقاف مؤقت' : 'تشغيل'}>
            <span className="listen-icon">{speaking ? <Wave /> : <Icon name="play" size={40} filled />}</span>
          </button>
        )}
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(heardAll ? 1 : Math.max(0, current) / lines.length) * 100}%` }} />
        </div>
        <div className="player-actions">
          <button type="button" className={`chip ${showText ? 'on' : ''}`} onClick={() => setShowText(!showText)}>
            <Icon name="text" size={18} /> {showText ? 'إخفاء النص' : 'شوف النص'}
          </button>
          <SpeedToggle />
        </div>
      </section>

      {(showText || !ttsSupported) && (
        <ol className="dialogue transcript">
          {segment.lines.map((l, i) => (
            <li key={i} className={`bubble ${l.speaker === Object.keys(lesson.characters)[0] ? 'them' : 'me'} ${speaking && i === lineIndex ? 'now' : ''}`}>
              <span className="bubble-speaker">{lesson.characters[l.speaker].nameAr}</span>
              <p><En>{l.en}</En></p>
            </li>
          ))}
        </ol>
      )}

      <PrimaryButton
        disabled={ttsSupported && !heardAll && !showText}
        onClick={() => {
          stop()
          setStage('questions')
          window.scrollTo(0, 0)
        }}
      >
        أجب عن {segment.questions.length} أسئلة
      </PrimaryButton>
      {ttsSupported && !heardAll && (
        <p className="muted small center">اسمع الجزء كاملًا لتظهر الأسئلة، أو افتح النص إذا احتجت.</p>
      )}
    </>
  )
}
