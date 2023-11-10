import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'

export type QuestionProps = {
  question: Question
  disabled?: boolean
  respondent: Respondent
  location: Location
}
