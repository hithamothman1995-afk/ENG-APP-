import { useMemo, useState } from 'react'
import placement from '../../content/placement.json'
import { levels, startClassFor } from '../content'
import { ttsSupported } from '../audio/speech'
import { useSpeech } from '../audio/useSpeech'
import { ArText } from '../components/ArText'
import { ListenButton, SpeedToggle } from '../components/Audio'
import { En } from '../components/En'
import { askedCount, nextPlacementStep, type PlacementBand, type PlacementItem } from '../logic/placement'
import { shuffled } from '../logic/shuffle'
import { Notice, PrimaryButton } from '../lessons/common'
import { href } from '../router'
import { loadPlacement, savePlacement, type PlacementResult } from '../storage/placement'
import { welcomeSeen } from './WelcomeScreen'

const bands = placement.bands as PlacementBand[]

// أول شي يشوفه الطالب: نحدد مستواه، وبعدها الجولة الترحيبية
export function PlacementScreen() {
  const [stage, setStage] = useState<'intro' | 'test' | 'result'>(() => (loadPlacement() ? 'result' : 'intro'))
  const [answers, setAnswers] = useState<boolean[][]>([])
  const [result, setResult] = useState<PlacementResult | null>(() => loadPlacement())
  const [picked, setPicked] = useState<number | null>(null)
  const { play, stop } = useSpeech()

  const step = nextPlacementStep(bands, answers)
  const item = step.kind === 'ask' ? bands[step.band].items[step.item] : null

  function sayIfListen(it: PlacementItem | null) {
    // نشغّل الصوت من نفس الضغطة، لأن آيفون يمنع التشغيل التلقائي
    if (it?.kind === 'listen' && it.audioEn) void play([{ text: it.audioEn, gender: 'female' }])
  }

  function begin() {
    setAnswers([])
    setPicked(null)
    setStage('test')
    window.scrollTo(0, 0)
    sayIfListen(bands[0].items[0])
  }

  function answer(isRight: boolean, choice: number) {
    if (step.kind !== 'ask' || picked !== null) return
    stop()
    setPicked(choice)
    const next = answers.map((a) => [...a])
    next[step.band] = [...(next[step.band] ?? []), isRight]
    const after = nextPlacementStep(bands, next)
    // وقفة قصيرة عشان يشوف اختياره، بدون ما نقول صح أو خطأ
    window.setTimeout(() => {
      setPicked(null)
      setAnswers(next)
      if (after.kind === 'done') {
        const r: PlacementResult = {
          levelIndex: after.levelIndex,
          asked: askedCount(next),
          correct: next.flat().filter(Boolean).length,
          at: new Date().toISOString(),
        }
        savePlacement(r)
        setResult(r)
        setStage('result')
        window.scrollTo(0, 0)
      }
    }, 280)
    if (after.kind === 'ask') sayIfListen(bands[after.band].items[after.item])
  }

  function startFromZero() {
    const r: PlacementResult = { levelIndex: 0, asked: 0, correct: 0, skipped: true, at: new Date().toISOString() }
    savePlacement(r)
    window.location.hash = welcomeSeen() ? startHref(0) : href({ name: 'welcome' })
  }

  if (stage === 'intro') {
    return (
      <main className="screen placement">
        <section className="card intro-card">
          <span className="hero-art placeholder" aria-hidden>🎯</span>
          <h1>نحدد مستواك أول</h1>
          <p className="lead"><ArText text={placement.introAr} /></p>
          <ul className="welcome-points">
            <li>⏱️ من 3 إلى 8 دقايق</li>
            <li>🎧 فيه أسئلة استماع، شغّل الصوت</li>
            <li>1️⃣ لكل سؤال محاولة وحدة</li>
          </ul>
          <Notice>{placement.noteAr}</Notice>
        </section>
        <SpeedToggle />
        <PrimaryButton onClick={begin}>ابدأ الاختبار</PrimaryButton>
        <button type="button" className="button" onClick={startFromZero}>أنا مبتدئ تمامًا، أبدأ من الصفر</button>
      </main>
    )
  }

  if (stage === 'result' && result) return <ResultCard result={result} onRetake={begin} />

  if (!item || step.kind !== 'ask') return null
  return (
    <main className="screen placement">
      <div className="step-bar">
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(step.band / bands.length) * 100}%` }} />
        </div>
        <span className="muted small">سؤال {askedCount(answers) + 1}</span>
      </div>
      <Question key={item.id} item={item} picked={picked} onAnswer={answer} />
    </main>
  )
}

function Question({
  item,
  picked,
  onAnswer,
}: {
  item: PlacementItem
  picked: number | null
  onAnswer: (isRight: boolean, choice: number) => void
}) {
  // نخلط الخيارات بنفس الترتيب كل مرة لنفس السؤال
  const order = useMemo(() => shuffled(item.options.map((_, i) => i), item.id), [item])
  const ltr = item.kind === 'gap'

  return (
    <>
      <section className="card placement-card">
        {item.kind === 'listen' &&
          (ttsSupported ? (
            <>
              <ListenButton big lines={[{ text: item.audioEn ?? '', gender: 'female' }]} />
              <p className="muted small">اضغط عشان تسمعها مرة ثانية</p>
            </>
          ) : (
            <p className="sentence"><En>{item.audioEn}</En></p>
          ))}
        {item.kind === 'gap' && (
          <p className="sentence">
            <En>{fillBlank(item.textEn ?? '')}</En>
          </p>
        )}
        {item.kind === 'read' && (
          <div className="reading" dir="ltr" lang="en">
            {(item.textEn ?? '').split('\n').map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        )}
        <p className="lead">{item.promptAr}</p>
      </section>
      <div className="options">
        {order.map((i) => (
          <button
            key={i}
            type="button"
            className={`option ${picked === i ? 'picked' : ''}`}
            disabled={picked !== null}
            onClick={() => onAnswer(i === 0, i)}
          >
            {ltr ? <En>{item.options[i]}</En> : item.options[i]}
          </button>
        ))}
      </div>
      <button type="button" className="link-button center" disabled={picked !== null} onClick={() => onAnswer(false, -1)}>
        ما أعرف
      </button>
    </>
  )
}

// يحوّل ___ لفراغ واضح
function fillBlank(text: string) {
  const [a, b] = text.split('___')
  return (
    <>
      {a}
      <span className="blank" aria-label="فراغ">　　　</span>
      {b}
    </>
  )
}

export function startHref(levelIndex: number): string {
  const start = startClassFor(levelIndex)
  return start ? href({ name: 'class', classId: start.classId }) : href({ name: 'map' })
}

function ResultCard({ result, onRetake }: { result: PlacementResult; onRetake: () => void }) {
  const level = levels[result.levelIndex]
  const start = startClassFor(result.levelIndex)
  const startClass = start && levels[start.levelIndex].classes.find((c) => c.id === start.classId)

  return (
    <main className="screen placement">
      <section className="card intro-card placement-result">
        <span className="hero-art placeholder" aria-hidden>{result.skipped ? '🌱' : '🎉'}</span>
        <span className="eyebrow">{result.skipped ? 'اخترت تبدأ من الصفر' : 'نتيجة الاختبار'}</span>
        <h1>مستواك: {level.titleAr}</h1>
        <p className="muted">المستوى {result.levelIndex + 1} من {levels.length}</p>
        <p className="lead">{level.descriptionAr}</p>
        {!result.skipped && <p className="muted">جاوبت {result.correct} من {result.asked} صح.</p>}
        {startClass &&
          (start.levelIndex === result.levelIndex ? (
            <Notice>بتبدأ بكلاس {startClass.icon} {startClass.titleAr}.</Notice>
          ) : (
            <Notice>كلاسات مستواك تنضاف قريبًا. إلى ذاك الحين تبدأ بكلاس {startClass.icon} {startClass.titleAr}.</Notice>
          ))}
        {!result.skipped && <p className="muted small">النتيجة تقريبية وتساعدك تعرف من وين تبدأ، ومو شهادة رسمية.</p>}
      </section>

      {welcomeSeen() ? (
        <a className="primary-button" href={startHref(result.levelIndex)}>يلّا نبدأ 🚀</a>
      ) : (
        <a className="primary-button" href={href({ name: 'welcome' })}>التالي: تعرّف على الدورة</a>
      )}
      <button type="button" className="button" onClick={onRetake}>أعد الاختبار</button>
    </main>
  )
}
