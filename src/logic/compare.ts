import { normalizeEnglish } from './text'

// مقارنة ما سمعه المتصفح بالعبارة المطلوبة، كلمة بكلمة،
// مع كشف أخطاء النطق الشائعة عند المتحدث بالعربية.

export type WordStatus = 'ok' | 'wrong' | 'missing'

export interface WordResult {
  target: string
  heard?: string
  status: WordStatus
}

export interface Comparison {
  accuracy: number // من 0 إلى 1
  words: WordResult[]
  extra: string[] // كلمات زائدة قالها المتعلم
  tipsAr: string[] // تصحيح صريح لأخطاء الأصوات
}

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "you're": 'you are',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "there's": 'there is',
  "don't": 'do not',
  "doesn't": 'does not',
  "can't": 'can not',
  cannot: 'can not',
  "i'll": 'i will',
  "i'd": 'i would',
  "isn't": 'is not',
  "you'll": 'you will',
  "we're": 'we are',
  "let's": 'let us',
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

export function tokens(text: string): string[] {
  return normalizeEnglish(text)
    .split(' ')
    .filter(Boolean)
    .flatMap((w) => (CONTRACTIONS[w] ?? w).split(' '))
    .map((w) => (/^\d+$/.test(w) && Number(w) < NUMBERS.length ? NUMBERS[Number(w)] : w))
}

// محاذاة الكلمتين بأقل عدد تعديلات (Levenshtein على مستوى الكلمات)
function align(target: string[], heard: string[]): { words: WordResult[]; extra: string[] } {
  const n = target.length
  const m = heard.length
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sub = target[i - 1] === heard[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub)
    }
  }
  const words: WordResult[] = []
  const extra: string[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (target[i - 1] === heard[j - 1] ? 0 : 1)) {
      const same = target[i - 1] === heard[j - 1]
      words.unshift({ target: target[i - 1], heard: heard[j - 1], status: same ? 'ok' : 'wrong' })
      i--
      j--
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      words.unshift({ target: target[i - 1], status: 'missing' })
      i--
    } else {
      extra.unshift(heard[j - 1])
      j--
    }
  }
  return { words, extra }
}

// أشهر أزواج الأصوات التي يخلط بينها المتحدث بالعربية
const SHORT_LONG_I = [
  ['pill', 'peel'],
  ['pills', 'peels'],
  ['ship', 'sheep'],
  ['live', 'leave'],
  ['sit', 'seat'],
  ['fill', 'feel'],
  ['it', 'eat'],
  ['his', 'he\'s'],
  ['bit', 'beat'],
  ['will', 'wheel'],
]

export function soundTipAr(target: string, heard: string): string {
  const said = `قلت ${heard}، والمطلوب ${target}`
  if (target.includes('p') && target.replace(/p/g, 'b') === heard) {
    return `${said}: حرف p يخرج بنفخة هواء من الشفتين بدون صوت من الحنجرة. ضع يدك على حنجرتك، يجب ألا تهتز.`
  }
  if (target.includes('v') && target.replace(/v/g, 'f') === heard) {
    return `${said}: في حرف v تلمس أسنانك العلوية شفتك السفلى وتهتز الحنجرة. في f لا تهتز.`
  }
  if (SHORT_LONG_I.some(([short, long]) => target === short && heard === long)) {
    return `${said}: صوت i هنا قصير وسريع ومرتخٍ، وليس ee الطويلة.`
  }
  if (SHORT_LONG_I.some(([short, long]) => target === long && heard === short)) {
    return `${said}: صوت ee هنا طويل، مدّه أكثر وابتسم قليلًا.`
  }
  if (target.endsWith('ing') && (heard === target.slice(0, -1) || heard === `${target.slice(0, -3)}in` || heard === `${target.slice(0, -2)}k`)) {
    return `${said}: في آخر ng يخرج الصوت من الأنف ولا يُنطق g ولا k بعده.`
  }
  return `${said}.`
}

export function compareSpeech(target: string, heard: string): Comparison {
  const t = tokens(target)
  const h = tokens(heard)
  const { words, extra } = align(t, h)
  const ok = words.filter((w) => w.status === 'ok').length
  const accuracy = t.length === 0 ? 1 : Math.max(0, (ok - extra.length * 0.5) / t.length)
  const tipsAr = words.filter((w) => w.status === 'wrong').map((w) => soundTipAr(w.target, w.heard!))
  return { accuracy: Math.min(1, accuracy), words, extra, tipsAr }
}

// يختار من بدائل المتصفح الأقرب للعبارة المطلوبة
export function bestMatch(target: string, alternatives: string[]): { heard: string; comparison: Comparison } {
  let best = { heard: alternatives[0] ?? '', comparison: compareSpeech(target, alternatives[0] ?? '') }
  for (const alt of alternatives.slice(1)) {
    const c = compareSpeech(target, alt)
    if (c.accuracy > best.comparison.accuracy) best = { heard: alt, comparison: c }
  }
  return best
}

export function speechStars(accuracy: number): number {
  if (accuracy >= 0.9) return 3
  if (accuracy >= 0.7) return 2
  if (accuracy >= 0.4) return 1
  return 0
}
