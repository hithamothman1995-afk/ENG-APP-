import { useState } from 'react'
import { classContents, levels } from '../content'
import { Icon } from '../components/Icon'
import { classStars, levelStatus } from '../logic/badges'
import { useProgress } from '../storage/ProgressContext'
import { Stars } from '../lessons/common'

const NAME_KEY = 'eng-app:learner-name'

function loadName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    // التخزين غير متاح
  }
}

const dateLabel = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' })

// شهادة إتمام مستوى: تنفتح لمن تخلّص كل كلاسات المستوى، وتقدر تحفظها PDF من زر الطباعة
export function CertificateScreen({ levelId }: { levelId: string }) {
  const { progress } = useProgress()
  const [name, setName] = useState(loadName)
  const [preview, setPreview] = useState(false)
  const index = levels.findIndex((l) => l.id === levelId)
  const level = levels[index]
  if (!level) return null

  const status = levelStatus(progress, level, classContents)
  const show = status.complete || preview
  const ready = level.classes.map((c) => classContents[c.id]).filter(Boolean)
  const avg = ready.length ? ready.reduce((s, c) => s + classStars(progress, c), 0) / ready.length : 0

  return (
    <main className="screen">
      <a className="back-link no-print" href="#/">
        <Icon name="back" size={20} />
        الرئيسية
      </a>

      {!show ? (
        <section className="card intro-card">
          <span className="big-emoji" aria-hidden>🎓</span>
          <h1>شهادة المستوى {index + 1}: {level.titleAr}</h1>
          <p className="lead">خلّص كل كلاسات المستوى وتنفتح لك الشهادة.</p>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${(status.done / status.total) * 100}%` }} />
          </div>
          <p className="muted">خلّصت {status.done} من {status.total} كلاسات</p>
          <button type="button" className="button" onClick={() => setPreview(true)}>شوف شكل الشهادة</button>
        </section>
      ) : (
        <>
          <label className="name-field no-print">
            <span className="muted small">اسمك على الشهادة</span>
            <input
              className="text-input"
              value={name}
              maxLength={40}
              placeholder="اكتب اسمك"
              onChange={(e) => {
                setName(e.target.value)
                saveName(e.target.value)
              }}
            />
          </label>

          <section className={`certificate ${preview && !status.complete ? 'is-preview' : ''}`}>
            {preview && !status.complete && <span className="cert-watermark" aria-hidden>معاينة</span>}
            <span className="cert-seal" aria-hidden>🎓</span>
            <p className="eyebrow">شهادة إتمام</p>
            <h1>المستوى {index + 1}: {level.titleAr}</h1>
            <p className="cert-name">{name.trim() || 'اسمك هنا'}</p>
            <p>أتمّ بنجاح كل كلاسات هذا المستوى في تطبيق مواقف لتعلّم الإنجليزي:</p>
            <ul className="cert-classes">
              {level.classes.map((c) => (
                <li key={c.id}>{c.icon} {c.titleAr}</li>
              ))}
            </ul>
            {status.complete && <Stars count={Math.round(avg)} size={22} />}
            <p className="muted small">{dateLabel.format(new Date())}</p>
          </section>

          {status.complete ? (
            <button type="button" className="primary-button no-print" onClick={() => window.print()}>
              احفظها أو اطبعها
            </button>
          ) : (
            <p className="muted small center no-print">هذي معاينة. الشهادة الحقيقية تنفتح لمن تخلّص المستوى.</p>
          )}
        </>
      )}
    </main>
  )
}
