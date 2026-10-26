import { useState } from 'react'
import type { Exercise } from '../content/types'
import { ArText } from '../components/ArText'
import { En } from '../components/En'
import { starsFromAccuracy } from '../logic/rewards'
import { sameAnswer } from '../logic/text'
import { PrimaryButton, StepBar, type Finish } from './common'

function correctText(e: Exercise): string {
  return e.kind === 'type' ? e.answer : e.options[e.answer]
}

// يعرض التمارين واحدًا تلو الآخر، ويحسب النجوم من نسبة الإجابات الصحيحة
export function ExerciseRunner({
  exercises,
  onFinish,
  onDone,
}: {
  exercises: Exercise[]
  onFinish?: Finish
  onDone?: (correct: number, total: number) => void // بدل onFinish: لمن يحتاج عدد الإجابات الصحيحة
}) {
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<boolean | null>(null)

  const ex = exercises[index]
  const ltrOptions = ex.kind === 'fill' || (ex.kind === 'choice' && ex.optionsLtr)

  function check(isRight: boolean) {
    setResult(isRight)
    if (isRight) setCorrect((c) => c + 1)
  }

  function next() {
    if (index === exercises.length - 1) {
      if (onDone) onDone(correct, exercises.length)
      else onFinish?.(starsFromAccuracy(correct, exercises.length))
      return
    }
    setIndex(index + 1)
    setPicked(null)
    setTyped('')
    setResult(null)
  }

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
            const state =
              result === null ? (picked === i ? 'picked' : '') : i === ex.answer ? 'right' : picked === i ? 'wrong' : ''
            return (
              <button
                key={i}
                type="button"
                className={`option ${state}`}
                disabled={result !== null}
                onClick={() => setPicked(i)}
              >
                {ltrOptions ? <En>{o}</En> : o}
              </button>
            )
          })}
        </div>
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
