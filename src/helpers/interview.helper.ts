import { computed } from 'vue'
import { QuestionProps } from '@/components/interview/questions/types'
import { makeValidationRules } from '@/components/interview/services/ValidatorService'

export function useVuetifyQuestionRules (props: QuestionProps) {
  return computed(() => {
    return makeValidationRules(props.question, props.question.questionParameters)
  })
}

export function useQuestionDisabled (props: QuestionProps) {
  return computed(() => {
    if (props.disabled) {
      return true
    } else if (props.question && props.question.datum) {
      return props.question.datum.dkRf !== null && props.question.datum.dkRf !== undefined
    } else {
      return false
    }
  })
}
