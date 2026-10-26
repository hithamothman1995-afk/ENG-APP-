import type { ClassContent, Lesson } from '../content/types'

// تومسن: مساعد ذكاء اصطناعي يشرح للمتعلم أي شيء لم يفهمه في الدرس.
// هذا الملف يبني ما يقرأه تومسن: قواعده، ومحتوى الدرس، وما يظهر على الشاشة.

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

const MAX_CONTEXT = 6000
const MAX_TURNS = 10

export const THOMSON_RULES = `أنت "تومسن"، مدرّس إنجليزي ودود وصبور داخل تطبيق لتعليم الإنجليزي للمتحدثين بالعربية (مستوى مبتدئ).
مهمتك: تشرح للمتعلم أي شيء لم يفهمه في الدرس الحالي.

القواعد:
- اكتب بالعربية الفصحى البسيطة، بجمل قصيرة. لا تستخدم Markdown ولا نجوم ولا عناوين.
- الجواب قصير: من 2 إلى 6 أسطر. ابدأ بالجواب مباشرة.
- اكتب الكلمات والجمل الإنجليزية كما هي بالحروف الإنجليزية، وأعطِ مثالًا من الدرس متى أمكن.
- إذا سأل عن النطق: اشرح بالعربي كيف يخرج الصوت (الشفتان، اللسان، الحنجرة)، وانتبه لأخطاء العرب الشائعة: p وb، وv وf، وi القصيرة وee الطويلة، وng، ونبرة الكلمة.
- إذا طلب جواب سؤال في التمرين: لا تعطه الجواب مباشرة. أعطه تلميحًا يساعده يفكر، وإذا أصر بعد تلميحين اشرح الجواب وسببه.
- لا تعطِ أي نصيحة طبية أو جرعات. الدروس عن التواصل فقط؛ إذا سأل عن دواء أو مرض فقل له يسأل الطبيب أو الصيدلي.
- إذا كان السؤال بعيدًا عن تعلّم الإنجليزي، رُدّ بلطف وارجع للدرس.
- شجّعه بكلمة قصيرة أحيانًا، بدون مبالغة.`

function lessonText(lesson: Lesson): string {
  switch (lesson.type) {
    case 'intro':
      return `الموقف: ${lesson.situationAr}\nالأهداف: ${lesson.goalsAr.join('، ')}`
    case 'listen-choose':
      return lesson.items.map((i) => `- ${i.audioEn}${i.ar ? ` (${i.ar})` : ''}`).join('\n')
    case 'phrases':
      return [
        'العبارات:',
        ...lesson.phrases.map((p) => `- ${p.en} = ${p.ar}${p.focus ? ` | نطق: ${p.focus.word}: ${p.focus.tipAr}` : ''}`),
        'التعابير الاصطلاحية:',
        ...lesson.idioms.map((i) => `- ${i.en} = ${i.meaningAr} (مثال: ${i.exampleEn})`),
      ].join('\n')
    case 'podcast':
      return lesson.segments
        .map((s, n) => `الجزء ${n + 1} (${s.titleAr}): مصطلحات: ${s.newTerms.map((t) => `${t.en} = ${t.ar}`).join('، ')}`)
        .join('\n')
    case 'vocab':
      return lesson.words.map((w) => `- ${w.en} ${w.ipa} نبرة ${w.stress} = ${w.ar}. مثال: ${w.exampleEn}`).join('\n')
    case 'grammar':
      return `${lesson.ruleTitleAr}: ${lesson.explanationAr}\n${lesson.points.map((p) => `- ${p.ar}: ${p.en}`).join('\n')}`
    case 'ai-chat':
      return lesson.scenarioAr
    case 'film':
      return `${lesson.sourceEn}\n` + lesson.lines.map((l) => `${l.speaker}: ${l.en} (${l.ar})`).join('\n') + '\nكلمات: ' + lesson.keyWords.map((k) => `${k.en} = ${k.ar}`).join('، ')
    case 'scene':
      return lesson.lines.map((l) => `${lesson.characters[l.speaker].nameEn}: ${l.en} (${l.ar})`).join('\n')
    case 'review':
      return lesson.introAr
  }
}

export function lessonContext(cls: ClassContent, lesson: Lesson): string {
  const text = `الكلاس: ${cls.titleAr} (${cls.titleEn})\nالدرس: ${lesson.titleAr}\n${lessonText(lesson)}`
  return text.slice(0, MAX_CONTEXT)
}

// المحادثة التي تُرسل: القواعد ومحتوى الدرس في أول رسالة، ثم آخر الأسئلة والأجوبة
export function buildTurns(context: string, screen: string, history: ChatTurn[], question: string): ChatTurn[] {
  const intro: ChatTurn = {
    role: 'user',
    content: `${THOMSON_RULES}\n\n--- محتوى الدرس الحالي ---\n${context}\n\n--- ما يظهر على شاشة المتعلم الآن ---\n${screen.slice(0, 1500)}`,
  }
  const recent = history.slice(-MAX_TURNS)
  // يجب أن تبدأ المحادثة برسالة المستخدم بعد التعليمات وتنتهي بها
  while (recent.length && recent[0].role === 'assistant') recent.shift()
  return [intro, ...recent, { role: 'user', content: question }]
}

// تنظيف بسيط إذا كتب النموذج رموز Markdown رغم التعليمات
export function cleanAnswer(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').replace(/^\s*[-*]\s+/gm, '• ').trim()
}
