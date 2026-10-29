// نطق الإنجليزي بصوت الجهاز نفسه (Web Speech API: speechSynthesis)
// مجاني ويعمل بدون خادم، لكن جودة الصوت وعدد الأصوات تختلف من جهاز لآخر.

export const ttsSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

let voices: SpeechSynthesisVoice[] = []

export type Gender = 'female' | 'male'

// أصوات "مضحكة" أو آلية في آيفون وماك (تطلع كأنها مكهربة)، ما نستخدمها أبدًا
const NOVELTY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|princess|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|junior|ralph|fred|kathy|vicki|victoria)\b/i

// نعرف جنس الصوت من اسمه، لأن المتصفح ما يعطينا هذي المعلومة
const FEMALE =
  /\b(samantha|ava|allison|susan|zoe|karen|moira|tessa|fiona|serena|kate|nicky|veena|martha|catherine|joelle|noelle|zira|aria|jenny|hazel|libby|sonia|emma|michelle|ana|female)\b|en-us-x-(iob|iog|sfg|tpc|tpf)|en-gb-x-(gba|gbc|gbg)/i
const MALE =
  /\b(alex|daniel|tom|aaron|arthur|oliver|gordon|rishi|evan|nathan|david|mark|guy|george|ryan|christopher|eric|brian|andrew|male)\b|en-us-x-(iol|iom|tpd)|en-gb-x-(gbb|gbd|rjs)/i

export function genderOf(name: string): Gender | null {
  // "Female" لازم يُفحص قبل "Male" لأن الكلمة الثانية داخل الأولى
  if (FEMALE.test(name)) return 'female'
  if (MALE.test(name)) return 'male'
  return null
}

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
    .filter((v) => v.lang.toLowerCase().startsWith('en') && !NOVELTY.test(v.name))
    // الترتيب بالاسم عند التساوي عشان يطلع نفس الصوت كل مرة
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))
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

// صوت ثابت لكل شخصية: نختار صوت بنت أو ولد حسب الشخصية، ورقمها يحدد أي صوت من نفس النوع.
// إذا ما لقينا صوت من النوع المطلوب نغيّر طبقة الصوت شوي بس، عشان ما يطلع مكهرب.
export function voiceFor(index: number, gender?: Gender): Voice {
  if (voices.length === 0) refreshVoices() // بعض المتصفحات تحمّل الأصوات متأخرًا
  if (voices.length === 0) return { voice: null, pitch: gender === 'male' ? 0.9 : gender === 'female' ? 1.1 : 1 }
  if (gender) {
    const same = voices.filter((v) => genderOf(v.name) === gender)
    if (same.length) return { voice: same[Math.floor(index / 2) % same.length], pitch: 1 }
    const unknown = voices.filter((v) => genderOf(v.name) === null)
    const pool = unknown.length ? unknown : voices
    return { voice: pool[index % pool.length], pitch: gender === 'male' ? 0.9 : 1.1 }
  }
  return { voice: voices[index % voices.length], pitch: voices.length > index ? 1 : 0.9 }
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
