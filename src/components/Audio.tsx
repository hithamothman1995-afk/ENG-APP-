import { RATES, setRate, useRate } from '../audio/prefs'
import { ttsSupported } from '../audio/speech'
import { useSpeech, type SpokenLine } from '../audio/useSpeech'
import { Icon } from './Icon'

// زر تشغيل الصوت. الضغط أثناء التشغيل يوقفه.
export function ListenButton({
  lines,
  big = false,
  label,
  onEnded,
}: {
  lines: SpokenLine[] | string
  big?: boolean
  label?: string
  onEnded?: () => void
}) {
  const { play, stop, speaking } = useSpeech()
  if (!ttsSupported) return null
  return (
    <button
      type="button"
      className={`listen-button ${big ? 'big' : ''} ${speaking ? 'speaking' : ''}`}
      aria-label={speaking ? 'إيقاف الصوت' : label ?? 'استمع'}
      onClick={async () => {
        if (speaking) return stop()
        const done = await play(lines)
        if (done) onEnded?.()
      }}
    >
      <span className="listen-icon">
        {speaking ? <Wave /> : <Icon name={big ? 'play' : 'volume'} size={big ? 40 : 22} filled={big} />}
      </span>
      {label && <span className="listen-label">{speaking ? 'إيقاف' : label}</span>}
    </button>
  )
}

export function Wave() {
  return (
    <span className="wave" aria-hidden>
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

export function SpeedToggle() {
  const rate = useRate()
  if (!ttsSupported) return null
  return (
    <div className="speed-toggle" role="group" aria-label="سرعة الصوت">
      {RATES.map((r) => (
        <button key={r.value} type="button" className={rate === r.value ? 'on' : ''} aria-pressed={rate === r.value} onClick={() => setRate(r.value)}>
          {r.label}
        </button>
      ))}
    </div>
  )
}

export function NoAudioNotice() {
  if (ttsSupported) return null
  return <p className="notice">متصفحك لا يدعم نطق الإنجليزي، لذلك ستظهر الجمل مكتوبة بدل الصوت. جرّب Chrome أو Safari بآخر تحديث.</p>
}
