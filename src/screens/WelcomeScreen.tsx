import { useState } from 'react'
import course from '../../content/course.json'
import { ArText } from '../components/ArText'
import { Notice, PrimaryButton } from '../lessons/common'
import { href } from '../router'

const SEEN_KEY = 'eng-app:welcome-seen'

export function welcomeSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // التخزين غير متاح
  }
}

interface Step {
  emoji: string
  titleAr: string
  bodyAr: string
  pointsAr: string[]
  noteAr?: string
}

// الجولة الترحيبية: معلومات الدورة، ايش بنتعلم، وايش بتستفيد في آخرها
export function WelcomeScreen() {
  const steps = course.steps as Step[]
  const [i, setI] = useState(0)
  const step = steps[i]
  const last = i === steps.length - 1

  return (
    <main className="screen welcome">
      <div className="welcome-dots" aria-label={`${i + 1} من ${steps.length}`}>
        {steps.map((_, k) => (
          <button key={k} type="button" className={k === i ? 'on' : k < i ? 'done' : ''} aria-label={`الخطوة ${k + 1}`} onClick={() => setI(k)} />
        ))}
      </div>

      <section key={i} className="card welcome-card">
        {i === 0 ? (
          <img className="welcome-art" src={`${import.meta.env.BASE_URL}art/covers/welcome.webp`} alt="" />
        ) : (
          <span className="welcome-emoji" aria-hidden>{step.emoji}</span>
        )}
        <h1>{step.titleAr}</h1>
        {step.bodyAr && <p className="lead"><ArText text={step.bodyAr} /></p>}
        <ul className="welcome-points">
          {step.pointsAr.map((p) => (
            <li key={p}><ArText text={p} /></li>
          ))}
        </ul>
        {step.noteAr && <Notice>{step.noteAr}</Notice>}
      </section>

      {last ? (
        <a
          className="primary-button"
          href={href({ name: 'class', classId: 'pharmacy' })}
          onClick={markSeen}
        >
          يلّا نبدأ أول كلاس 🚀
        </a>
      ) : (
        <PrimaryButton onClick={() => { setI(i + 1); window.scrollTo(0, 0) }}>التالي</PrimaryButton>
      )}
      {i > 0 && (
        <button type="button" className="button" onClick={() => setI(i - 1)}>رجوع</button>
      )}
      {!last && (
        <a className="link-button center" href="#/" onClick={markSeen}>تخطَّ الجولة</a>
      )}
    </main>
  )
}
