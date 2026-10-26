// نطق الإنجليزي بصوت الجهاز نفسه (Web Speech API: speechSynthesis)
// مجاني ويعمل بدون خادم، لكن جودة الصوت وعدد الأصوات تختلف من جهاز لآخر.

export const ttsSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

let voices: SpeechSynthesisVoice[] = []

// الأصوات الأوضح أولًا: الأمريكي ثم البريطاني، والأصوات المحسّنة قبل العادية
function rank(v: SpeechSynthesisVoice): number {
  let score = 0
  if (v.lang.replace('_', '-').startsWith('en-US')) score += 4
  else if (v.lang.replace('_', '-').startsWith('en-GB')) score += 3
  if (/enhanced|premium|natural|neural|google/i.test(v.name)) score += 2
  if (v.localService) score += 1
  return score
}

function refreshVoices() {
  if (!ttsSupported) return
  voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => rank(b) - rank(a))
}

// يُستدعى مرة عند فتح التطبيق، لأن بعض المتصفحات تحمّل الأصوات متأخرًا
export function warmUpVoices() {
  if (!ttsSupported) return
  refreshVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
}

export function englishVoiceCount(): number {
  return voices.length
}

export interface Voice {
  voice: SpeechSynthesisVoice | null
  pitch: number
}

// صوت مختلف لكل شخصية. إذا كان في الجهاز صوت واحد فقط نغيّر طبقة الصوت للتمييز.
export function voiceFor(index: number): Voice {
  const pitches = [1, 0.85, 1.2]
  if (voices.length === 0) return { voice: null, pitch: pitches[index % pitches.length] }
  const voice = voices[index % voices.length]
  const pitch = voices.length > index ? 1 : pitches[index % pitches.length]
  return { voice, pitch }
}

// مدة تقديرية للجملة، تُستخدم كاحتياط إذا لم يرسل المتصفح حدث النهاية
export function estimateSeconds(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return (words * 0.42) / rate + 0.6
}

let token = 0

export function stopSpeaking() {
  token++
  if (ttsSupported) window.speechSynthesis.cancel()
}

// ينطق جملة ويرجع وعدًا ينتهي عند انتهاء النطق (أو عند الإيقاف)
export function speak(text: string, opts: { rate?: number; voice?: Voice } = {}): Promise<void> {
  if (!ttsSupported) return Promise.resolve()
  const rate = opts.rate ?? 1
  const mine = ++token
  // في سفاري آيفون، cancel ثم speak مباشرة قد يُسقط الجملة، لذلك لا نلغي إلا إذا كان هناك صوت يعمل
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) window.speechSynthesis.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = opts.voice?.voice?.lang ?? 'en-US'
    if (opts.voice?.voice) u.voice = opts.voice.voice
    u.pitch = opts.voice?.pitch ?? 1
    u.rate = rate
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve()
    }
    u.onend = finish
    u.onerror = finish
    const timer = setTimeout(finish, (estimateSeconds(text, rate) * 2 + 3) * 1000)
    if (mine === token) window.speechSynthesis.speak(u)
    else finish()
  })
}

export function currentToken(): number {
  return token
}
