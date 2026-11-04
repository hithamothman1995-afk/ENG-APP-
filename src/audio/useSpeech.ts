import { useCallback, useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking, voiceFor, type Gender, type Voice } from './speech'
import { useRate } from './prefs'

export interface SpokenLine {
  text: string
  voice?: number // رقم الشخصية، لاختيار صوت مختلف
  gender?: Gender // بنت أو ولد، عشان الصوت يناسب الشخصية
}

let sequence = 0

// خطاف لنطق جملة واحدة أو سلسلة جمل، مع معرفة أي سطر يُنطق الآن
export function useSpeech() {
  const rate = useRate()
  const [speaking, setSpeaking] = useState(false)
  const [lineIndex, setLineIndex] = useState(-1)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      sequence++
      stopSpeaking()
    }
  }, [])

  const stop = useCallback(() => {
    sequence++
    stopSpeaking()
    setSpeaking(false)
    setLineIndex(-1)
  }, [])

  // يرجع true إذا اكتملت السلسلة، وfalse إذا أوقفها المستخدم
  const play = useCallback(
    async (lines: SpokenLine[] | string, opts: { rate?: number; from?: number } = {}): Promise<boolean> => {
      const list = typeof lines === 'string' ? [{ text: lines }] : lines
      const mine = ++sequence
      setSpeaking(true)
      for (let i = opts.from ?? 0; i < list.length; i++) {
        if (mine !== sequence) return false
        if (mounted.current) setLineIndex(i)
        const voice: Voice = voiceFor(list[i].voice ?? 0, list[i].gender)
        await speak(list[i].text, { rate: opts.rate ?? rate, voice })
        // وقفة قصيرة بين المتكلمين ليسهل الفهم
        if (list.length > 1) await new Promise((r) => setTimeout(r, 350))
      }
      if (mine !== sequence) return false
      if (mounted.current) {
        setSpeaking(false)
        setLineIndex(-1)
      }
      return true
    },
    [rate],
  )

  return { play, stop, speaking, lineIndex, rate }
}
