import QuestionDatum from '../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'

export enum ConditionTagScope {
  RESPONDENT = 'respondent',
  SURVEY = 'survey',
  SECTION = 'section'
}

export interface ConditionTagInterface {
  [ConditionTagScope.RESPONDENT]: RespondentConditionTag[]
  [ConditionTagScope.SECTION]: SectionConditionTag[]
  [ConditionTagScope.SURVEY]: SurveyConditionTag[]
}

export default interface InterviewDataInterface {
  data: QuestionDatum[],
  conditionTags: ConditionTagInterface
}
