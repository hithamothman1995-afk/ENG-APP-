// أنواع البيانات التي تصف ملفات المحتوى في مجلد content/

export type LessonType =
  | 'intro'
  | 'phrases'
  | 'vocab'
  | 'vocab-practice'
  | 'idiom'
  | 'listening'
  | 'grammar'
  | 'ai-chat'
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
}

export type Exercise =
  | { kind: 'choice'; questionAr: string; options: string[]; answer: number; optionsLtr?: boolean }
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

export interface PhrasesLesson extends LessonBase {
  type: 'phrases'
  phrases: Phrase[]
}

export interface VocabLesson extends LessonBase {
  type: 'vocab'
  words: Word[]
}

export interface VocabPracticeLesson extends LessonBase {
  type: 'vocab-practice'
  exercises: Exercise[]
}

export interface IdiomLesson extends LessonBase {
  type: 'idiom'
  en: string
  ar: string
  literalAr: string
  meaningAr: string
  examples: Bilingual[]
}

export interface ListeningLesson extends LessonBase {
  type: 'listening'
  introAr: string
  dialogue: (Bilingual & { speaker: string })[]
  speakers: Record<string, string>
  questions: { questionAr: string; options: string[]; answer: number }[]
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
  scenarioAr: string
  targetPhraseIds: string[]
  openingEn: string
}

export interface ReviewLesson extends LessonBase {
  type: 'review'
  introAr: string
}

export type Lesson =
  | IntroLesson
  | PhrasesLesson
  | VocabLesson
  | VocabPracticeLesson
  | IdiomLesson
  | ListeningLesson
  | GrammarLesson
  | AiChatLesson
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
