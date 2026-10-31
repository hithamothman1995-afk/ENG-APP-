// اختبار تحديد المستوى: لكل مستوى 3 أسئلة، ونجاح المستوى = سؤالين صح على الأقل.
// نمشي من أسهل مستوى، وأول مستوى ما ينجح فيه الطالب هو اللي يبدأ منه.

export interface PlacementItem {
  id: string
  kind: 'listen' | 'gap' | 'read'
  audioEn?: string // للاستماع: الجملة تنقال بصوت الجهاز وما تنكتب
  textEn?: string // للتكملة والقراءة: النص الإنجليزي اللي يشوفه الطالب
  promptAr: string
  options: string[] // الجواب الصح دائمًا أول خيار، ونخلطها وقت العرض
}

export interface PlacementBand {
  levelId: string
  items: PlacementItem[]
}

export const PASS_PER_BAND = 2

export type PlacementStep =
  | { kind: 'ask'; band: number; item: number }
  | { kind: 'done'; levelIndex: number }

// answers[b] = نتائج أسئلة المستوى b بالترتيب (true صح)
export function nextPlacementStep(bands: PlacementBand[], answers: boolean[][]): PlacementStep {
  for (let b = 0; b < bands.length; b++) {
    const results = answers[b] ?? []
    const right = results.filter(Boolean).length
    const wrong = results.length - right
    if (right >= PASS_PER_BAND) continue // نجح، ونتخطى باقي أسئلة المستوى
    if (wrong > bands[b].items.length - PASS_PER_BAND) return { kind: 'done', levelIndex: b }
    return { kind: 'ask', band: b, item: results.length }
  }
  return { kind: 'done', levelIndex: bands.length - 1 }
}

// عدد الأسئلة اللي انسألت لين الحين
export function askedCount(answers: boolean[][]): number {
  return answers.reduce((n, a) => n + a.length, 0)
}
