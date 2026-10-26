import { useState } from 'react'
import { useSpeech } from '../audio/useSpeech'

// صورة الكلمة: تدخل بحركة، وتنط لما تضغطها. بعد الإجابة الضغط ينطق الكلمة
export function WordPicture({ src, say }: { src: string; say?: string }) {
  const [bounce, setBounce] = useState(0)
  const [hint, setHint] = useState(false)
  const { play } = useSpeech()
  return (
    <div className="word-picture-wrap">
      <button
        type="button"
        className={`word-picture ${say ? 'can-say' : ''}`}
        aria-label={say ? `اسمع ${say}` : 'صورة الكلمة'}
        onClick={() => {
          setBounce(bounce + 1)
          if (say) void play(say)
          else setHint(true)
        }}
      >
        <img key={bounce} src={`${import.meta.env.BASE_URL}${src}`} alt="" className={bounce ? 'boing' : ''} />
        {say && <span className="word-picture-badge" aria-hidden>🔊</span>}
      </button>
      {hint && !say && <span className="muted small">اختر الجواب أول، بعدها اضغط الصورة وتسمع الكلمة</span>}
    </div>
  )
}
