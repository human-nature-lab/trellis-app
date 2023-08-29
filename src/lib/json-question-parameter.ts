import { ref, watch, computed } from 'vue'
import builder from '../services/builder'
import Question from '../entities/trellis/question'
import { debounce } from 'lodash'
import PT from '../static/parameter.types'

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

  const index = computed(() => {
    const index = question.questionParameters.findIndex(p => +p.parameterId === PT.json)
    return index
  })

  const qParameter = computed(() => {
    return index.value > -1 ? question.questionParameters[index.value] : null
  })

  const initialValue = qParameter.value
    ? JSON.parse(qParameter.value.val)
    : defaultValue
  const config = ref<T>(initialValue)
  const loading = ref(false)
  const error = ref<Error>(null)
  const update = async (newConfig: T) => {
    loading.value = true
    try {
      const parameter: QuestionParameterSnake = Object.assign(
        qParameter.value || {},
        { name: 'json', question_id: question.id, val: JSON.stringify(newConfig) },
      )
      const res = await builder.createOrUpdateParameter(parameter)
      question.questionParameters[index.value] = res
      prevQuestionParam = res
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

  let prevQuestionParam = qParameter.value
  watch(() => qParameter.value, newParam => {
    console.log('questionParameters changed')
    if (newParam && newParam !== prevQuestionParam) {
      config.value = JSON.parse(newParam.val)
    }
  })
  return { config, loading, update, error }
}
