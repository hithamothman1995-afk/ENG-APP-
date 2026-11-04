import { useState } from 'react'
import { classContents } from '../content'
import { Icon } from '../components/Icon'
import { ReviewDeck } from '../lessons/ReviewView'
import { dueItems } from '../logic/srs'
import { useProgress } from '../storage/ProgressContext'

const SESSION_MAX = 20

// مراجعة اليوم: العبارات والكلمات اللي جا موعدها من كل الكلاسات
export function ReviewScreen() {
  const { progress } = useProgress()
  // نثبّت القائمة عند الفتح، لأن كل جواب يغيّر موعد البطاقة
  const [items] = useState(() => dueItems(progress, Object.values(classContents), new Date()).slice(0, SESSION_MAX))
  const [result, setResult] = useState<{ known: number; total: number } | null>(null)

  return (
    <main className="screen">
      <a className="back-link" href="#/">
        <Icon name="back" size={20} />
        الرئيسية
      </a>
      <header>
        <h1>مراجعة اليوم 🔁</h1>
        <p className="muted">التطبيق يرجّع لك الكلمات قبل ما تنساها. اللي تعرفه يبعد موعده، واللي تنساه يرجع لك قريب.</p>
      </header>

      {items.length === 0 ? (
        <section className="card intro-card">
          <span className="big-emoji" aria-hidden>🎉</span>
          <p className="lead">ما عندك شي تراجعه الحين.</p>
          <p className="muted">كمّل دروس جديدة، والعبارات اللي تتعلمها بتجيك هنا في وقتها.</p>
        </section>
      ) : result ? (
        <section className="card intro-card">
          <span className="big-emoji" aria-hidden>✅</span>
          <p className="lead">خلصت مراجعة اليوم!</p>
          <p className="muted">عرفت {result.known} من {result.total}. اللي ما عرفته بيرجع لك بكرة.</p>
          <a className="primary-button" href="#/">رجوع للرئيسية</a>
        </section>
      ) : (
        <ReviewDeck items={items} onDone={(known, total) => setResult({ known, total })} />
      )}
    </main>
  )
}
