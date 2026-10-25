import { En } from './En'

// نص عربي قد يحتوي كلمات إنجليزية (مثل «الـp في prescription»).
// نعزل كل جزء إنجليزي حتى لا يختلط ترتيب الكلمات في الاتجاه من اليمين لليسار.
const LATIN_RUN = /([A-Za-zɪŋːæəʃʒθðʊɑɔ][A-Za-z0-9ɪŋːæəʃʒθðʊɑɔ'’\-/]*(?:[ .,?!…]+[A-Za-z0-9ɪŋːæəʃʒθðʊɑɔ'’\-/]+)*[?!.…]?)/

export function ArText({ text }: { text: string }) {
  const parts = text.split(LATIN_RUN)
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <En key={i}>{part}</En> : part))}
    </>
  )
}
