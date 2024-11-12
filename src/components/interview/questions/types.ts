import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'
import { InterviewLocation } from '../services/InterviewAlligator'

export type QuestionProps = {
  question: Question
  disabled?: boolean
  respondent: Respondent
  location: InterviewLocation
}
