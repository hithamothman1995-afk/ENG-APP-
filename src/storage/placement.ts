// نتيجة اختبار تحديد المستوى، محفوظة على الجهاز
const KEY = 'eng-app:placement'

export interface PlacementResult {
  levelIndex: number // رقم المستوى من 0
  asked: number
  correct: number
  skipped?: boolean // اختار يبدأ من الصفر بدون اختبار
  at: string
}

export function loadPlacement(): PlacementResult | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PlacementResult) : null
  } catch {
    return null
  }
}

export function savePlacement(r: PlacementResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(r))
  } catch {
    // التخزين غير متاح: نكمل بدون حفظ
  }
}
