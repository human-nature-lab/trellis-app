import { ConditionTagScope } from '../src/services/interview/InterviewDataInterface'

export enum ShowHide {
  SHOW = 'show',
  HIDE = 'hide'
}

export enum AnyAll {
  ANY = 'any',
  ALL = 'all'
}

export interface Sortable {
  sortOrder: number
}

export interface ConditionTagTemplate {
  conditionTag: string
}

export interface SkipTemplate extends Sortable {
  showHide: ShowHide
  anyAll: AnyAll
  conditions: ConditionTagTemplate[]
}

export interface ChoiceTemplate extends Sortable {
  label: string
  val: string | number
}

export interface AssignConditionTagTemplate {
  conditionTag: string
  scope: ConditionTagScope
  logic: string
}

export interface ParameterTemplate {
  type: string
  val: string | number | boolean
}

export interface QuestionTemplate extends Sortable {
  label: string
  questionType: string,
  varName: string,
  choices: ChoiceTemplate[],
  parameters: ParameterTemplate[]
  assignConditionTags: AssignConditionTagTemplate[]
}

export interface PageTemplate extends Sortable {
  questions: QuestionTemplate[],
  skips: SkipTemplate[]
}

export interface SectionTemplate extends Sortable {
  label?: string
  pages: PageTemplate[]
  isRepeatable: boolean
  maxRepetitions?: number,
  followUpQuestionId?: string,
  randomizeFollowUp?: boolean
}

export interface FormTemplate {
  sections: SectionTemplate[]
}
