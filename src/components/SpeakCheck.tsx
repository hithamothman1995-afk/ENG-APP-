import { useState } from 'react'
import { LISTEN_ERRORS_AR, listenOnce, recognitionSupported, type ListenError } from '../audio/recognition'
import { stopSpeaking } from '../audio/speech'
import { bestMatch, speechStars, type Comparison } from '../logic/compare'
import { ArText } from './ArText'
import { En } from './En'
import { Icon } from './Icon'
import { Wave } from './Audio'

const SELF_RATINGS = [
  { stars: 3, label: 'قلتها صحيحة' },
  { stars: 2, label: 'قريبة منها' },
  { stars: 1, label: 'لم أستطع' },
]

// يسمع المتعلم وهو يقول العبارة، ويقارنها بالمطلوب، ويعطي نجومًا وتصحيحًا صريحًا.
// إذا لم يدعم المتصفح السماع، يكتب المتعلم أو يقيّم نفسه.
export function SpeakCheck({ target, onScore }: { target: string; onScore: (stars: number) => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'result'>('idle')
  const [error, setError] = useState<ListenError | null>(null)
  const [heard, setHeard] = useState('')
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [stopFn, setStopFn] = useState<(() => void) | null>(null)
  const [tries, setTries] = useState(0)

  async function start() {
    stopSpeaking()
    setError(null)
    setState('listening')
    const l = listenOnce()
    setStopFn(() => l.stop)
    try {
      const alts = await l.result
      const best = bestMatch(target, alts)
      setHeard(best.heard)
      setComparison(best.comparison)
      setTries((t) => t + 1)
      setState('result')
    } catch (e) {
      setError(e as ListenError)
      setState('idle')
    }
  }

  const stars = comparison ? speechStars(comparison.accuracy) : 0
  const canListen = recognitionSupported && error !== 'not-allowed' && error !== 'unsupported'

  if (!canListen) {
    return (
      <div className="speak-check">
        {error && <p className="feedback wrong">{LISTEN_ERRORS_AR[error]}</p>}
        <p className="muted">قل العبارة بصوت عالٍ مرتين، ثم قيّم نفسك:</p>
        <div className="rating-buttons">
          {SELF_RATINGS.map((r) => (
            <button key={r.stars} type="button" className="button" onClick={() => onScore(r.stars)}>
              {'★'.repeat(r.stars)} {r.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="speak-check">
      {state !== 'result' && (
        <>
          <button
            type="button"
            className={`mic-button ${state === 'listening' ? 'on' : ''}`}
            onClick={() => (state === 'listening' ? stopFn?.() : start())}
          >
            {state === 'listening' ? <Wave /> : <Icon name="mic" size={30} />}
            <span>{state === 'listening' ? 'أسمعك الآن… اضغط عند الانتهاء' : 'اضغط وقل العبارة'}</span>
          </button>
          {error && <p className="feedback wrong">{LISTEN_ERRORS_AR[error]}</p>}
        </>
      )}

      {state === 'result' && comparison && (
        <section className={`card heard-card ${stars >= 2 ? 'good' : 'retry'}`} role="status">
          <span className="eyebrow">سمعتك تقول:</span>
          <p className="heard-words">
            <En>
              {comparison.words.map((w, i) => (
                <span key={i} className={`hw ${w.status}`}>
                  {w.status === 'missing' ? '___' : w.heard}{' '}
                </span>
              ))}
            </En>
          </p>
          {heard === '' && <p className="muted">لم أفهم كلمات واضحة.</p>}
          <p className="heard-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
          {comparison.tipsAr.slice(0, 2).map((t) => (
            <p key={t} className="tip"><ArText text={t} /></p>
          ))}
          {comparison.words.some((w) => w.status === 'missing') && (
            <p className="tip">
              نسيت: <En>{comparison.words.filter((w) => w.status === 'missing').map((w) => w.target).join(', ')}</En>
            </p>
          )}
          <div className="row-buttons">
            <button type="button" className="button" onClick={start}>حاول مرة ثانية</button>
            <button type="button" className="primary-button" onClick={() => onScore(stars)}>
              {stars >= 2 ? 'التالي' : 'متابعة'}
            </button>
          </div>
          {tries >= 2 && stars < 2 && (
            <button type="button" className="link-button" onClick={() => onScore(2)}>
              متأكد أنك قلتها صح؟ الجهاز أحيانًا يخطئ، اعتبرها صحيحة
            </button>
          )}
        </section>
      )}
      <p className="muted small">التقييم تقريبي: يعتمد على تعرّف جهازك على الكلام، وليس قياسًا دقيقًا للنطق.</p>
    </div>
  )
}
