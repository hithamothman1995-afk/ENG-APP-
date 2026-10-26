import type { ChatTurn } from './thomson'

// من يجيب على أسئلة تومسن؟
// - داخل رابط التجربة في Claude: قدرة sample (على حساب Claude الخاص بالمشاهد، بعد موافقته).
// - النسخة المنشورة لاحقًا: خادم صغير يحفظ مفتاح API في ملف .env (لم يُبنَ بعد، يحتاج موافقتك).

export type AskError = 'unavailable' | 'not_granted' | 'rate_limited' | 'refused' | 'failed' | 'cancelled'

export interface Asker {
  ask: (turns: ChatTurn[], onText: (text: string) => void, signal: AbortSignal) => Promise<string>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SampleFn = (input: ChatTurn[], options: any) => Promise<{ text: string }>

let cached: Promise<Asker | null> | null = null

export function getAsker(): Promise<Asker | null> {
  if (cached) return cached
  cached = (async () => {
    const claude = (window as any).claude
    if (!claude?.use) return null
    const sample: SampleFn | null = await claude.use('sample').catch(() => null)
    if (!sample) return null
    return {
      ask: async (turns, onText, signal) => {
        try {
          const r = await sample(turns, { onText: ({ text }: { text: string }) => onText(text), signal, cache: false, modelTier: 'quick' })
          return r.text
        } catch (e: any) {
          const code = e?.code as string
          if (code === 'cancelled') throw 'cancelled'
          if (code === 'not_granted' || code === 'sampling_disabled' || code === 'not_declared' || code === 'capability_disabled') throw 'not_granted'
          if (code === 'rate_limited' || code === 'session_expired') throw 'rate_limited'
          if (code === 'refused') throw 'refused'
          throw 'failed'
        }
      },
    }
  })()
  return cached
}

export const ASK_ERRORS_AR: Record<AskError, string> = {
  unavailable: 'تومسن يعمل حاليًا داخل رابط التجربة فقط. في النسخة المنشورة سيحتاج خادمًا صغيرًا ومفتاح API، ولن نضيفه إلا بموافقتك.',
  not_granted: 'لم يُسمح لتومسن بالإجابة. إذا أردت استخدامه، اسمح له من نافذة الإذن عند السؤال.',
  rate_limited: 'أسئلة كثيرة في وقت قصير. انتظر قليلًا ثم اسأل مرة ثانية.',
  refused: 'تومسن لا يستطيع الإجابة عن هذا السؤال. جرّب تسأله بطريقة ثانية عن الدرس.',
  failed: 'انقطع الاتصال. حاول مرة ثانية.',
  cancelled: '',
}
