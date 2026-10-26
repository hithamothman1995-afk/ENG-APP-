import type { AiChatLesson, Phrase } from '../content/types'
import { tokens } from '../logic/compare'
import { starsFromAccuracy } from '../logic/rewards'
import type { ChatTurn } from './thomson'

// محادثة الدور (مثلًا: الصيدلي). هذا الملف يبني ما يقرأه الذكاء الاصطناعي ويفهم ردوده.

export const MAX_LEARNER_TURNS = 8 // بعدها نطلب الملخص تلقائيًا

export interface RoleLine {
  en: string
  ar: string
  end: boolean // الشخصية أنهت الموقف
}

function roleRules(lesson: AiChatLesson, targets: Phrase[]): string {
  return `You are role-playing inside an English-learning app for Arabic speakers (beginner level, A1-A2).
Your role: ${lesson.roleEn}. Stay in this role the whole time.
The situation (in Arabic, for you): ${lesson.scenarioAr}
Steps to walk the learner through, one at a time: ${lesson.stepsEn.join('; ')}.
Phrases the learner is practising: ${targets.map((p) => `"${p.en}"`).join(', ')}.

Rules:
- Speak simple, natural English: 1 or 2 short sentences, common words, one question at a time.
- Never correct the learner's mistakes during the chat. If you don't understand, ask kindly in simpler words.
- If the learner writes in Arabic, reply in simple English and gently invite them to try in English.
- No real medical advice: invented, generic answers only, like a role-play.
- When the last step is done, close the conversation politely and add END on its own line.
- Always answer in exactly this format, with no other text:
EN: <your English line>
AR: <a short Arabic translation of your line>`
}

export function buildRoleTurns(lesson: AiChatLesson, targets: Phrase[], chat: ChatTurn[]): ChatTurn[] {
  const opening: ChatTurn = { role: 'assistant', content: `EN: ${lesson.openingEn}\nAR: ${lesson.openingAr}` }
  return [{ role: 'user', content: roleRules(lesson, targets) + '\n\nStart now.' }, opening, ...chat]
}

// يفهم رد الشخصية حتى لو جاء بشكل غير مرتب
export function parseRoleLine(text: string): RoleLine {
  const end = /^\s*END\s*$/m.test(text)
  const clean = text.replace(/^\s*END\s*$/m, '').trim()
  const en = clean.match(/EN:\s*([\s\S]*?)(?=\n\s*AR:|$)/)?.[1]?.trim()
  const ar = clean.match(/AR:\s*([\s\S]*)$/)?.[1]?.trim()
  return { en: en || clean.replace(/^AR:[\s\S]*$/m, '').trim(), ar: ar ?? '', end }
}

// هل استخدم المتعلم العبارة؟ نكفي بـ 75% من كلماتها بنفس الترتيب تقريبًا
export function usedPhrase(phraseEn: string, said: string): boolean {
  const want = tokens(phraseEn)
  const got = tokens(said)
  if (want.length === 0) return false
  let j = 0
  let hits = 0
  for (const w of want) {
    const k = got.indexOf(w, j)
    if (k >= 0) {
      hits++
      j = k + 1
    }
  }
  return hits / want.length >= 0.75
}

export function usedPhraseIds(targets: Phrase[], learnerLines: string[]): string[] {
  return targets.filter((p) => learnerLines.some((l) => usedPhrase(p.en, l))).map((p) => p.id)
}

// النجوم: لازم تتكلم 3 مرات على الأقل، ثم حسب عدد العبارات اللي استخدمتها
export function chatStars(learnerTurns: number, used: number, total: number): number {
  if (learnerTurns < 3) return Math.min(1, learnerTurns)
  return Math.max(2, starsFromAccuracy(used, total))
}

export function buildFeedbackTurns(lesson: AiChatLesson, transcript: ChatTurn[]): ChatTurn[] {
  const lines = transcript
    .map((t) => (t.role === 'user' ? `Learner: ${t.content}` : `${lesson.roleEn}: ${parseRoleLine(t.content).en}`))
    .join('\n')
  return [
    {
      role: 'user',
      content: `أنت مدرّس إنجليزي ودود لمتعلم عربي مبتدئ. هذه محادثة تدريب بينه وبين "${lesson.roleAr}":

${lines}

اكتب له ملخصًا بالعربية البسيطة، بدون Markdown ولا نجوم، بهذا الشكل بالضبط:
أحسنت في: جملة أو جملتان عن أفضل ما قاله، مع مثال من كلامه.
أهم الأخطاء:
1. ما قاله ← الصحيح بالإنجليزي، وسبب قصير بالعربي
2. ...
3. ...
جملة تدرّب عليها: جملة إنجليزية واحدة مفيدة للموقف.
إذا كانت أخطاؤه أقل من 3 فاذكر الموجود فقط. ركّز على الأخطاء التي تغيّر المعنى أو تتكرر عند العرب. لا تصحّح علامات الترقيم أو الحروف الكبيرة.`,
    },
  ]
}
