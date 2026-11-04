import { setSfx, useSfx } from '../audio/sfx'

// زر تشغيل/إيقاف أصوات الصح والغلط
export function SoundToggle() {
  const on = useSfx()
  return (
    <button
      type="button"
      className="icon-button sound-toggle"
      aria-pressed={on}
      aria-label={on ? 'إيقاف أصوات التمارين' : 'تشغيل أصوات التمارين'}
      title={on ? 'أصوات التمارين شغالة' : 'أصوات التمارين مقفلة'}
      onClick={() => setSfx(!on)}
    >
      <span aria-hidden>{on ? '🔔' : '🔕'}</span>
    </button>
  )
}
