// سماع صوت المتعلم عبر SpeechRecognition في المتصفح.
// مدعوم في Chrome على أندرويد وفي Safari على آيفون (iOS 14.5 وما بعد).
// التعرّف تقريبي: يحاول تخمين الكلمات، ولا يقيس النطق بدقة صوتية.

/* eslint-disable @typescript-eslint/no-explicit-any */
type RecognitionCtor = new () => any

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as any
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as RecognitionCtor | null
}

export const recognitionSupported = getCtor() !== null

export type ListenError = 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | 'other'

export interface Listening {
  result: Promise<string[]> // البدائل التي سمعها المتصفح، الأرجح أولًا
  stop: () => void
}

export function listenOnce(maxMs = 9000): Listening {
  const Ctor = getCtor()
  if (!Ctor) return { result: Promise.reject<string[]>('unsupported'), stop: () => {} }
  const rec = new Ctor()
  rec.lang = 'en-US'
  rec.interimResults = false
  rec.maxAlternatives = 4
  rec.continuous = false

  const result = new Promise<string[]>((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => rec.stop(), maxMs)
    rec.onresult = (e: any) => {
      settled = true
      clearTimeout(timer)
      const alts: string[] = []
      const r = e.results[0]
      for (let i = 0; i < r.length; i++) alts.push(r[i].transcript)
      resolve(alts)
    }
    rec.onerror = (e: any) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const code = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'not-allowed' : e.error === 'no-speech' ? 'no-speech' : e.error === 'network' ? 'network' : 'other'
      reject(code as ListenError)
    }
    rec.onend = () => {
      clearTimeout(timer)
      if (!settled) {
        settled = true
        reject('no-speech' as ListenError)
      }
    }
  })

  try {
    rec.start()
  } catch {
    return { result: Promise.reject<string[]>('other'), stop: () => {} }
  }
  return { result, stop: () => rec.stop() }
}

export const LISTEN_ERRORS_AR: Record<ListenError, string> = {
  'not-allowed': 'لم يُسمح باستخدام الميكروفون. اسمح به من إعدادات المتصفح، أو اكتب العبارة بدلًا من ذلك.',
  'no-speech': 'لم أسمع شيئًا. اقترب من الميكروفون وحاول مرة ثانية.',
  network: 'التعرّف على الصوت يحتاج اتصالًا بالإنترنت في هذا المتصفح. حاول مرة ثانية أو اكتب العبارة.',
  unsupported: 'متصفحك لا يدعم سماع الصوت. اكتب العبارة بدلًا من ذلك.',
  other: 'حدثت مشكلة في الميكروفون. حاول مرة ثانية أو اكتب العبارة.',
}
