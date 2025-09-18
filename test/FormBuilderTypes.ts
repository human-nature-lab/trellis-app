import { ConditionAssignmentAPI } from '../src/components/interview/classes/ConditionAssignmentAPI'
import { ConditionTagScope } from '../src/services/interview/InterviewDataInterface'

export interface ConditionLogic {
  (vars: {[key: string]: string | string[]}, api: ConditionAssignmentAPI): boolean
}

export enum ShowHide {
  SHOW = 'show',
  HIDE = 'hide'
}

export enum AnyAll {
  ANY = 'any',
  ALL = 'all'
}

export interface Sortable {
  sortOrder?: number
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
  id?: string
  label: string
  val: string | number
}

export interface AssignConditionTagTemplate {
  conditionTag: string
  scope?: ConditionTagScope
  logic: string | ConditionLogic
}

export interface ParameterTemplate {
  type: string
  val: string | number | boolean
}

export interface QuestionTemplate extends Sortable {
  id?: string
  label: string
  questionType: string,
  varName: string,
  choices: (ChoiceTemplate | string)[],
  parameters: ParameterTemplate[]
  assignConditionTags: AssignConditionTagTemplate[]
}

export interface PageTemplate extends Sortable {
  id?: string
  questions?: QuestionTemplate[],
  skips?: SkipTemplate[]
}

export interface SectionTemplate extends Sortable {
  id?: string
  label?: string
  pages: PageTemplate[]
  isRepeatable?: boolean
  maxRepetitions?: number,
  followUpQuestionId?: string,
  randomizeFollowUp?: boolean
  randomizePages?: boolean
}

export interface FormTemplate {
  sections: SectionTemplate[]
}
