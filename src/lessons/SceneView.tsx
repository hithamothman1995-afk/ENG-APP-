import { useState } from 'react'
import type { SceneLesson } from '../content/types'
import { ttsSupported } from '../audio/speech'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { ListenButton, NoAudioNotice, SpeedToggle, Wave } from '../components/Audio'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { starsFromAccuracy } from '../logic/rewards'
import { ExerciseRunner } from './ExerciseRunner'
import { PrimaryButton, type Finish } from './common'

const ROUNDS = [
  { emoji: '🎬', titleAr: 'الجولة الأولى: افهم القصة', descAr: 'اسمع المشهد وتابع النص الإنجليزي. حتى لو ما فهمت كل كلمة، الصوت والسياق يوضحان لك كثيرًا.' },
  { emoji: '🔥', titleAr: 'الجولة الثانية: ثبّت الفهم', descAr: 'نفس المشهد مع الترجمة وشرح الكلمات المهمة، ثم أسئلة قصيرة.' },
  { emoji: '🎧', titleAr: 'الجولة الثالثة: التحدي', descAr: 'نفس المشهد بدون أي نص. ركّز على السمع فقط. هل تفهم القصة الآن؟' },
]

// مشهد صوتي أصلي يُسمع ثلاث مرات، بدل مقاطع الأفلام (لها حقوق نشر)
export function SceneView({ lesson, onFinish }: { lesson: SceneLesson; onFinish: Finish }) {
  const [round, setRound] = useState(0)
  const [heard, setHeard] = useState(false)
  const [quiz, setQuiz] = useState<'no' | 'running' | 'done'>('no')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const { play, stop, speaking, lineIndex } = useSpeech()

  const first = Object.keys(lesson.characters)[0]
  const lines = lesson.lines.map((l) => ({ text: l.en, voice: lesson.characters[l.speaker].voice, gender: lesson.characters[l.speaker].gender }))
  const r = ROUNDS[round]
  const nowSpeaker = speaking ? lesson.lines[lineIndex]?.speaker : undefined

  async function toggle() {
    if (speaking) return stop()
    const done = await play(lines)
    if (done) setHeard(true)
  }

  function nextRound() {
    stop()
    setRound(round + 1)
    setHeard(false)
    window.scrollTo(0, 0)
  }

  if (quiz === 'running') {
    return (
      <ExerciseRunner
        exercises={lesson.questions.map((q) => ({ kind: 'choice', ...q }))}
        onDone={(correct, total) => {
          setScore({ correct, total })
          setQuiz('done')
          nextRound()
        }}
      />
    )
  }

  return (
    <>
      {round === 0 && (
        <section className="card intro-card">
          <span className="eyebrow"><En>{lesson.titleEn}</En></span>
          <p><ArText text={lesson.introAr} /></p>
        </section>
      )}
      <NoAudioNotice />

      <div className="rounds">
        {ROUNDS.map((x, i) => (
          <span key={x.titleAr} className={`round ${i === round ? 'on' : i < round ? 'done' : ''}`}>{i + 1}</span>
        ))}
      </div>

      <section className="card player-card">
        <h2>{r.emoji} {r.titleAr}</h2>
        <p className="muted">{r.descAr}</p>
        <div className="speakers">
          {Object.entries(lesson.characters).map(([id, c]) => (
            <span key={id} className={`speaker ${nowSpeaker === id ? 'talking' : ''}`}>
              <span className="avatar" aria-hidden>{c.emoji}</span>
              {c.nameAr}
            </span>
          ))}
        </div>
        {ttsSupported && (
          <button type="button" className={`listen-button big ${speaking ? 'speaking' : ''}`} onClick={toggle} aria-label={speaking ? 'إيقاف' : 'تشغيل المشهد'}>
            <span className="listen-icon">{speaking ? <Wave /> : <Icon name={heard ? 'replay' : 'play'} size={40} filled={!heard} />}</span>
          </button>
        )}
        <SpeedToggle />
      </section>

      {(round < 2 || !ttsSupported) && (
        <ol className="dialogue transcript">
          {lesson.lines.map((l, i) => (
            <li key={i} className={`bubble ${l.speaker === first ? 'them' : 'me'} ${speaking && i === lineIndex ? 'now' : ''}`}>
              <span className="bubble-speaker">{lesson.characters[l.speaker].nameAr}</span>
              <div className="phrase-row">
                <p><En>{l.en}</En></p>
                {round === 1 && <ListenButton lines={[{ text: l.en, voice: lesson.characters[l.speaker].voice, gender: lesson.characters[l.speaker].gender }]} />}
              </div>
              {round === 1 && <p className="muted">{l.ar}</p>}
            </li>
          ))}
        </ol>
      )}

      {round === 1 && (
        <section className="card">
          <span className="eyebrow">كلمات مهمة في المشهد</span>
          <ul className="term-list">
            {lesson.keyWords.map((k) => (
              <li key={k.en}>
                <En>{k.en}</En>
                <span className="muted">{k.ar}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {round === 0 && (
        <PrimaryButton disabled={ttsSupported && !heard} onClick={nextRound}>إلى الجولة الثانية</PrimaryButton>
      )}
      {round === 1 && (
        <PrimaryButton disabled={ttsSupported && !heard} onClick={() => { stop(); setQuiz('running'); window.scrollTo(0, 0) }}>
          أجب عن {lesson.questions.length} أسئلة
        </PrimaryButton>
      )}
      {round === 2 && (
        <PrimaryButton disabled={ttsSupported && !heard} onClick={() => onFinish(starsFromAccuracy(score.correct, score.total))}>
          فهمت القصة، أنهِ الدرس
        </PrimaryButton>
      )}
      {ttsSupported && !heard && <p className="muted small center">اسمع المشهد كاملًا للمتابعة.</p>}
    </>
  )
}
