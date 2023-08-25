import { ref, watch } from 'vue'
import builder from '../services/builder'
import Question from '../entities/trellis/question'
import { debounce } from 'lodash'

type QuestionParameterSnake = {
  id?: string
  question_id: string
  name: string
  val: string
}

export function jsonQuestionParameter<T extends object> (
  question: Question,
  defaultValue: T = {},
) {
  const initialValue = question.questionParameters.length
    ? JSON.parse(question.questionParameters[0].val)
    : defaultValue
  const config = ref<T>(initialValue)
  const loading = ref(false)
  const error = ref<Error>(null)
  const update = async (newConfig: T) => {
    loading.value = true
    try {
      const parameter: QuestionParameterSnake = Object.assign(
        question.questionParameters.length ? question.questionParameters[0] : {},
        { name: 'json', question_id: question.id, val: JSON.stringify(newConfig) },
      )
      const res = await builder.createOrUpdateParameter(parameter)
      question.questionParameters = [res]
      prevQuestionParams = question.questionParameters
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const debouncedUpdate = debounce(update, 500)

  watch(config, () => {
    console.log('config changed')
    debouncedUpdate(config.value)
  }, { deep: true })

  let prevQuestionParams = question.questionParameters
  watch(() => question.questionParameters, newParams => {
    console.log('questionParameters changed')
    if (newParams && newParams !== prevQuestionParams && newParams.length) {
      config.value = JSON.parse(newParams[0].val)
    }
  })
  return { config, loading, update, error }
}
