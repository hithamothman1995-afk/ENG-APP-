import { useSyncExternalStore } from 'react'

// أصوات قصيرة للصح والغلط وإنهاء الدرس. نولّدها بالمتصفح (Web Audio) بدون ملفات ولا مكتبات.

const KEY = 'eng-app:sfx'

function readOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

let on = readOn()
const listeners = new Set<() => void>()

export function setSfx(value: boolean) {
  on = value
  try {
    localStorage.setItem(KEY, value ? 'on' : 'off')
  } catch {
    // التخزين غير متاح
  }
  listeners.forEach((l) => l())
}

export function useSfx(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => on,
  )
}

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (!on) return null
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

// نغمة واحدة: تردد، بداية، مدة، نوع الموجة، ارتفاع الصوت
function tone(a: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

// صح: نغمتان صاعدتان مع لمعة خفيفة
export function playCorrect() {
  const a = audio()
  if (!a) return
  tone(a, 784, 0, 0.16, 'triangle', 0.25) // G5
  tone(a, 1175, 0.09, 0.28, 'triangle', 0.25) // D6
  tone(a, 2349, 0.12, 0.22, 'sine', 0.06) // لمعة
}

// غلط: نغمة منخفضة نازلة، هادئة وغير مزعجة، مع اهتزاز خفيف للجوال
export function playWrong() {
  const a = audio()
  if (a) {
    tone(a, 220, 0, 0.18, 'sine', 0.3, 180)
    tone(a, 165, 0.14, 0.26, 'sine', 0.3, 130)
  }
  try {
    if (on) navigator.vibrate?.(90)
  } catch {
    // الاهتزاز غير مدعوم
  }
}

// إنهاء الدرس: لحن احتفال قصير
export function playComplete() {
  const a = audio()
  if (!a) return
  const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
  notes.forEach((f, i) => tone(a, f, i * 0.1, 0.3, 'triangle', 0.22))
  tone(a, 1568, 0.42, 0.5, 'sine', 0.08)
}
