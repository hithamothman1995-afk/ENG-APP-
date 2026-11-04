// كل سؤال له محاولتان: الصح من أول مرة = نقطة كاملة، من ثاني مرة = نصف نقطة
export const MAX_ATTEMPTS = 2

export function attemptPoints(attempt: number): number {
  if (attempt === 1) return 1
  if (attempt === 2) return 0.5
  return 0
}

// بعد إجابة: هل انتهى السؤال؟ (صح، أو خلصت المحاولات)
export function isSettled(isRight: boolean, attempt: number): boolean {
  return isRight || attempt >= MAX_ATTEMPTS
}
