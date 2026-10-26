import { useState } from 'react'
import type { Exercise } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { attemptPoints, isSettled, MAX_ATTEMPTS } from '../logic/attempts'
import { starsFromAccuracy } from '../logic/rewards'
import { sameAnswer } from '../logic/text'
import { PrimaryButton, StepBar, type Finish } from './common'

function correctText(e: Exercise): string {
  return e.kind === 'type' ? e.answer : e.options[e.answer]
}

// يعرض التمارين واحدًا تلو الآخر. لكل سؤال محاولتان؛ بعد الخطأ الثاني تظهر الإجابة الصحيحة
export function ExerciseRunner({
  exercises,
  onFinish,
  onDone,
}: {
  exercises: Exercise[]
  onFinish?: Finish
  // بدل onFinish: points = مجموع النقاط (نصف نقطة للصح من ثاني محاولة)، right = عدد الأسئلة اللي انحلت صح
  onDone?: (points: number, total: number, right: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [points, setPoints] = useState(0)
  const [right, setRight] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<boolean | null>(null)

  const ex = exercises[index]
  const ltrOptions = ex.kind === 'fill' || (ex.kind === 'choice' && ex.optionsLtr)

  function check(isRight: boolean) {
    if (!isSettled(isRight, attempt)) {
      // خطأ أول: نعلّم الخيار الغلط ونعطي محاولة ثانية
      if (picked !== null) setWrongPicks([...wrongPicks, picked])
      setPicked(null)
      setAttempt(attempt + 1)
      return
    }
    setResult(isRight)
    if (isRight) {
      setPoints((p) => p + attemptPoints(attempt))
      setRight((r) => r + 1)
    }
  }

  function next() {
    if (index === exercises.length - 1) {
      if (onDone) onDone(points, exercises.length, right)
      else onFinish?.(starsFromAccuracy(points, exercises.length))
      return
    }
    setIndex(index + 1)
    setAttempt(1)
    setWrongPicks([])
    setPicked(null)
    setTyped('')
    setResult(null)
  }

  const retrying = result === null && attempt > 1

  return (
    <>
      <StepBar done={index + (result === null ? 0 : 1)} total={exercises.length} />
      <section className="card">
        {ex.kind === 'choice' && ex.labelAr && <span className="tag">{ex.labelAr}</span>}
        <p className="lead"><ArText text={ex.questionAr} /></p>
        {ex.kind === 'fill' && (
          <p className="sentence">
            <En>{ex.sentence.replace('___', '_____')}</En>
          </p>
        )}
      </section>

      {ex.kind === 'type' ? (
        <input
          className="text-input"
          dir="ltr"
          lang="en"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="اكتب هنا"
          value={typed}
          disabled={result !== null}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && typed.trim() && result === null && check(sameAnswer(typed, ex.answer))}
        />
      ) : (
        <div className="options">
          {ex.options.map((o, i) => {
            const tried = wrongPicks.includes(i)
            const state =
              result === null
                ? tried ? 'wrong' : picked === i ? 'picked' : ''
                : i === ex.answer ? 'right' : picked === i || tried ? 'wrong' : ''
            return (
              <button
                key={i}
                type="button"
                className={`option ${state}`}
                disabled={result !== null || tried}
                onClick={() => setPicked(i)}
              >
                {ltrOptions ? <En>{o}</En> : o}
              </button>
            )
          })}
        </div>
      )}

      {retrying && (
        <p className="feedback retry" role="status">
          خطأ، عندك محاولة ثانية ({attempt} من {MAX_ATTEMPTS})
        </p>
      )}
      {result === null ? (
        <PrimaryButton
          disabled={ex.kind === 'type' ? !typed.trim() : picked === null}
          onClick={() => check(ex.kind === 'type' ? sameAnswer(typed, ex.answer) : picked === ex.answer)}
        >
          تحقق
        </PrimaryButton>
      ) : (
        <>
          <p className={`feedback ${result ? 'right' : 'wrong'}`} role="status">
            {result ? 'إجابة صحيحة!' : <>الإجابة الصحيحة: {ltrOptions || ex.kind === 'type' ? <En>{correctText(ex)}</En> : correctText(ex)}</>}
          </p>
          <PrimaryButton onClick={next}>{index === exercises.length - 1 ? 'إنهاء' : 'التالي'}</PrimaryButton>
        </>
      )}
    </>
  )
}
