// أنواع البيانات التي تصف ملفات المحتوى في مجلد content/

export type LessonType =
  | 'intro'
  | 'listen-choose'
  | 'phrases'
  | 'podcast'
  | 'vocab'
  | 'grammar'
  | 'ai-chat'
  | 'scene'
  | 'review'

interface LessonBase {
  id: string
  titleAr: string
}

export interface SoundFocus {
  sound: string // مثل "p" أو "v" أو "stress"
  contrast?: string // الصوت الذي يخلط به المتعلم العربي
  word: string
  wrong?: string // كيف تبدو الكلمة إذا نُطقت خطأ
  tipAr: string
}

export interface Phrase {
  id: string
  promptAr: string
  en: string
  ar: string
  focus?: SoundFocus
}

export interface Word {
  id: string
  en: string
  ar: string
  ipa: string
  stress: string
  exampleEn: string
  exampleAr: string
  noteAr?: string
  distractors: [string, string] // خياران خاطئان قريبان من الكلمة
}

export interface Idiom {
  id: string
  en: string
  meaningAr: string
  literalAr: string // الترجمة الحرفية، لنفهم لماذا لا نترجمه كلمة بكلمة
  exampleEn: string
  exampleAr: string
}

export type Exercise =
  | { kind: 'choice'; questionAr: string; options: string[]; answer: number; optionsLtr?: boolean; labelAr?: string }
  | { kind: 'fill'; questionAr: string; sentence: string; options: string[]; answer: number }
  | { kind: 'type'; questionAr: string; answer: string }

export interface Bilingual {
  en: string
  ar: string
}

export interface IntroLesson extends LessonBase {
  type: 'intro'
  situationAr: string
  goalsAr: string[]
  soundsAr: string
  noteAr?: string
}

export interface ListenChooseItem {
  audioEn: string // الجملة التي تُنطق
  ar?: string // ترجمتها، تظهر بعد الإجابة
  options: string[]
  answer: number
  noteAr?: string
}

export interface ListenChooseLesson extends LessonBase {
  type: 'listen-choose'
  introAr: string
  mode: 'sentence' | 'meaning' // اختر الجملة التي سمعتها، أو اختر معناها بالعربي
  items: ListenChooseItem[]
}

export interface PhrasesLesson extends LessonBase {
  type: 'phrases'
  phrases: Phrase[]
  idioms: Idiom[]
}

export interface VocabLesson extends LessonBase {
  type: 'vocab'
  words: Word[]
}

export interface ChoiceQuestion {
  questionAr: string
  options: string[]
  answer: number
  optionsLtr?: boolean
}

export interface Line extends Bilingual {
  speaker: string
}

export interface Character {
  nameAr: string
  nameEn: string
  voice: number // رقم الصوت، لكل شخصية صوت مختلف
  emoji: string
}

export interface PodcastQuestion extends ChoiceQuestion {
  tag: 'term' | 'idiom' | 'general'
}

export interface PodcastSegment {
  titleAr: string
  lines: { speaker: string; en: string }[]
  newTerms: Bilingual[] // المصطلحات الجديدة في هذا الجزء
  questions: PodcastQuestion[]
}

export interface PodcastLesson extends LessonBase {
  type: 'podcast'
  titleEn: string
  introAr: string
  characters: Record<string, Character>
  segments: PodcastSegment[]
}

export interface SceneLesson extends LessonBase {
  type: 'scene'
  titleEn: string
  introAr: string
  characters: Record<string, Character>
  lines: Line[]
  keyWords: Bilingual[]
  questions: ChoiceQuestion[]
}

export interface GrammarLesson extends LessonBase {
  type: 'grammar'
  ruleTitleAr: string
  explanationAr: string
  points: Bilingual[]
  exercises: Exercise[]
}

export interface AiChatLesson extends LessonBase {
  type: 'ai-chat'
  roleAr: string
  roleEn: string // وصف الدور للذكاء الاصطناعي
  scenarioAr: string
  stepsEn: string[] // خطوات الموقف بالترتيب
  targetPhraseIds: string[]
  openingEn: string
  openingAr: string
}

export interface ReviewLesson extends LessonBase {
  type: 'review'
  introAr: string
}

export type Lesson =
  | IntroLesson
  | ListenChooseLesson
  | PhrasesLesson
  | PodcastLesson
  | VocabLesson
  | GrammarLesson
  | AiChatLesson
  | SceneLesson
  | ReviewLesson

export interface ClassContent {
  id: string
  levelId: string
  titleAr: string
  titleEn: string
  lessons: Lesson[]
}

export interface ClassSummary {
  id: string
  titleAr: string
  titleEn: string
  icon: string
}

export interface Level {
  id: string
  titleAr: string
  descriptionAr: string
  classes: ClassSummary[]
}
