import { computed, onBeforeUnmount, ref } from 'vue'
import InterviewManager, { watchSharedInterview } from '@/components/interview/classes/InterviewManager'
import { QuestionProps } from '@/components/interview/questions/types'
import { makeValidationRules } from '@/components/interview/services/ValidatorService'

export function useManager () {
  const managerInstance = ref<InterviewManager>()
  const unsubscribe = watchSharedInterview(m => {
    managerInstance.value = m
  })
  onBeforeUnmount(unsubscribe)
  return managerInstance
}

export function useDataStore () {
  const manager = useManager()
  return computed(() => {
    const res = manager.value ? manager.value.data : null
    return res
  })
}

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
