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

export interface LessonMeta {
  id: string
  type: LessonType
  titleAr: string
}

export interface ClassContent {
  id: string
  levelId: string
  titleAr: string
  titleEn: string
  lessons: LessonMeta[]
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
