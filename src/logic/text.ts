// تطبيع النص الإنجليزي للمقارنة: أحرف صغيرة، بدون علامات ترقيم، ومسافات موحدة
export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sameAnswer(given: string, expected: string): boolean {
  return normalizeEnglish(given) === normalizeEnglish(expected)
}
