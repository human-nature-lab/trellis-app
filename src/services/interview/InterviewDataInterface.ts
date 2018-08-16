import QuestionDatum from "../../entities/trellis/QuestionDatum";
import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag";
import SurveyConditionTag from "../../entities/trellis/SurveyConditionTag";
import SectionConditionTag from "../../entities/trellis/SectionConditionTag";

export interface ConditionTagInterface {
  respondent: RespondentConditionTag[]
  section: SectionConditionTag[]
  survey: SurveyConditionTag[]
}

export default interface InterviewDataInterface {
  data: QuestionDatum[],
  conditionTags: ConditionTagInterface
}
