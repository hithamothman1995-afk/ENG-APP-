import { useState, type ReactNode } from 'react'
import type { FilmKeyWord, FilmLesson } from '../content/types'
import { ArText } from '../components/ArText'
import { ListenButton } from '../components/Audio'
import { En } from '../components/En'
import { starsFromAccuracy } from '../logic/rewards'
import { ExerciseRunner } from './ExerciseRunner'
import { Notice, PrimaryButton, type Finish } from './common'

const ROUNDS = [
  { emoji: '▶️', titleAr: 'شاهد مع النص', descAr: 'شوف المشهد وتابع الكلام بالإنجليزي. الكلمات الملوّنة هي اللي بنتعلمها.' },
  { emoji: '📚', titleAr: 'تعلّم من المشهد', descAr: 'شوفه مرة ثانية مع الترجمة، واقرأ شرح الكلمات المهمة.' },
  { emoji: '✅', titleAr: 'اختبر نفسك', descAr: 'أسئلة قصيرة عن المشهد والكلمات.' },
  { emoji: '🎧', titleAr: 'التحدي: بدون نص', descAr: 'شوف المشهد آخر مرة بدون أي نص. تفهمه الحين؟' },
]

// يلوّن الكلمات المهمة داخل الجملة
function highlight(text: string, words: FilmKeyWord[]): ReactNode[] {
  const list = words.map((w) => w.en).sort((a, b) => b.length - a.length)
  const escaped = list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  return text.split(re).map((part, i) => (i % 2 === 1 ? <mark key={i} className="key">{part}</mark> : part))
}

function Video({ lesson, round }: { lesson: FilmLesson; round: number }) {
  const [reload, setReload] = useState(0)
  if (!lesson.youtubeId) {
    return <Notice>المقطع بينضاف هنا من يوتيوب قريبًا. تقدر الحين تقرأ المشهد وتسمعه بصوت التطبيق.</Notice>
  }
  const params = new URLSearchParams({ rel: '0', playsinline: '1', modestbranding: '1', cc_load_policy: '0' })
  if (lesson.start) params.set('start', String(lesson.start))
  if (lesson.end) params.set('end', String(lesson.end))
  return (
    <div className="film-frame">
      <iframe
        key={`${round}-${reload}`}
        src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?${params}`}
        title={lesson.titleEn}
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <button type="button" className="chip" onClick={() => setReload(reload + 1)}>↺ من البداية</button>
    </div>
  )
}

// مشهد حقيقي من فيلم أو مسلسل: شاهد، تعلّم، اختبر، ثم التحدي بدون نص
export function FilmView({ lesson, onFinish }: { lesson: FilmLesson; onFinish: Finish }) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const r = ROUNDS[round]
  const speakers = [...new Set(lesson.lines.map((l) => l.speaker))]
  const voice = (s: string) => speakers.indexOf(s)

  function go(n: number) {
    setRound(n)
    window.scrollTo(0, 0)
  }

  if (round === 2) {
    return (
      <ExerciseRunner
        exercises={lesson.questions.map((q) => ({ kind: 'choice', ...q }))}
        onDone={(points, total) => {
          setScore({ correct: points, total })
          go(3)
        }}
      />
    )
  }

  return (
    <>
      {round === 0 && (
        <section className="card intro-card">
          <span className="eyebrow"><En>{lesson.sourceEn}</En></span>
          <p><ArText text={lesson.introAr} /></p>
        </section>
      )}

      <div className="rounds">
        {ROUNDS.map((x, i) => (
          <span key={x.titleAr} className={`round ${i === round ? 'on' : i < round ? 'done' : ''}`}>{i + 1}</span>
        ))}
      </div>

      <section className="card player-card">
        <h2>{r.emoji} {r.titleAr}</h2>
        <p className="muted">{r.descAr}</p>
        <Video lesson={lesson} round={round} />
        {!lesson.youtubeId && (
          <ListenButton big lines={lesson.lines.map((l) => ({ text: l.en, voice: voice(l.speaker) }))} label="اسمع المشهد" />
        )}
      </section>

      {round < 2 && (
        <ol className="dialogue transcript">
          {lesson.lines.map((l, i) => (
            <li key={i} className={`bubble ${voice(l.speaker) === 0 ? 'them' : 'me'}`}>
              <span className="bubble-speaker"><En>{l.speaker}</En></span>
              <div className="phrase-row">
                <p><En>{highlight(l.en, lesson.keyWords)}</En></p>
                {round === 1 && <ListenButton lines={[{ text: l.en, voice: voice(l.speaker) }]} />}
              </div>
              {round === 1 && <p className="muted">{l.ar}</p>}
            </li>
          ))}
        </ol>
      )}

      {round === 1 && (
        <section className="card">
          <span className="eyebrow">كلمات المشهد</span>
          <ul className="film-words">
            {lesson.keyWords.map((k) => (
              <li key={k.en}>
                <div className="phrase-row">
                  <p><mark className="key"><En>{k.en}</En></mark> <span className="muted">= {k.ar}</span></p>
                  <ListenButton lines={k.en} />
                </div>
                <p className="small"><ArText text={k.noteAr} /></p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {round === 0 && <PrimaryButton onClick={() => go(1)}>شفته، نتعلّم منه</PrimaryButton>}
      {round === 1 && <PrimaryButton onClick={() => go(2)}>اختبرني ({lesson.questions.length} أسئلة)</PrimaryButton>}
      {round === 3 && (
        <PrimaryButton onClick={() => onFinish(starsFromAccuracy(score.correct, score.total))}>فهمت المشهد، أنهِ الدرس</PrimaryButton>
      )}

      <p className="muted small center">
        المشهد من <En>{lesson.sourceEn}</En>، والحقوق لأصحابها. نعرضه من يوتيوب لغرض التعلّم.
      </p>
    </>
  )
}
