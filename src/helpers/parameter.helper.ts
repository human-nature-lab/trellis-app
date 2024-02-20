import Question from '@/entities/trellis/Question'
import builder from '../services/builder'
import { computed, ref, watch } from 'vue'
import PT from '@/static/parameter.types'
import { debounce } from 'lodash'
import { Mutex } from 'async-mutex'

export type QuestionParameterSnake = {
  id?: string
  question_id: string
  name: string
  val: string
}

type Serializer<T> = {
  deserialize: (v: string) => T
  serialize: (v: T) => string
}

export const NumberSerializer: Serializer<number> = {
  deserialize: v => +v,
  serialize: v => '' + v,
}

export const StringSerializer: Serializer<string> = {
  deserialize: v => v,
  serialize: v => v,
}

export const BooleanSerializer: Serializer<boolean> = {
  deserialize: v => v === '1' || v === 'true',
  serialize: v => v ? '1' : '0',
}

export const JSONSerializer: Serializer<any> = {
  deserialize: v => JSON.parse(v),
  serialize: v => JSON.stringify(v),
}

export function useQuestionParameter<T> (question: Question, parameterId: PT, initialValue: T, serializer: Serializer<T>, shouldUpdate = false) {
  const loading = ref(false)
  const error = ref<Error>(null)
  const index = computed(() => {
    return question.questionParameters.findIndex(p => +p.parameterId === parameterId)
  })
  const qParameter = computed(() => {
    return index.value > -1 ? question.questionParameters[index.value] : null
  })
  const val = ref(qParameter.value ? serializer.deserialize(qParameter.value.val) : initialValue)
  let prevVal = serializer.deserialize(serializer.serialize(val.value))
  const update = async (newVal: T) => {
    if (loading.value) return
    try {
      loading.value = true
      const parameter: QuestionParameterSnake = Object.assign(
        qParameter.value || {},
        { name: PT[parameterId], question_id: question.id, val: serializer.serialize(newVal) },
      )
      const res = await builder.createOrUpdateParameter(parameter)
      prevVal = val.value
      val.value = serializer.deserialize(res.val)
      question.questionParameters[index.value] = res
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  if (shouldUpdate) {
    watch(val, (newVal) => {
      if (newVal !== null && newVal !== undefined && serializer.serialize(newVal) !== serializer.serialize(prevVal) && !loading.value) {
        update(newVal)
      }
    }, { deep: true })
  }

  return { val, update, loading, error }
}

export function useJsonQuestionParameter<T extends object> (
  question: Question,
  parameterId: PT,
  defaultValue: T = {},
) {
  const index = computed(() => {
    const index = question.questionParameters.findIndex(p => +p.parameterId === parameterId)
    return index
  })

  const qParameter = computed(() => {
    return index.value > -1 ? question.questionParameters[index.value] : null
  })

  const initialValue = qParameter.value
    ? JSON.parse(qParameter.value.val)
    : defaultValue
  const val = ref<T>(initialValue)
  const loading = ref(false)
  const error = ref<Error>(null)
  const update = async (newVal: T) => {
    if (loading.value) return
    loading.value = true
    try {
      const parameter: QuestionParameterSnake = Object.assign(
        qParameter.value || {},
        { name: PT[parameterId], question_id: question.id, val: JSON.stringify(newVal) },
      )
      const res = await builder.createOrUpdateParameter(parameter)
      question.questionParameters[index.value] = res
      val.value = JSON.parse(res.val)
      prevQuestionParam = res
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const debouncedUpdate = debounce(update, 500)

  watch(val, () => {
    console.log('val changed')
    debouncedUpdate(val.value)
  }, { deep: true })

  let prevQuestionParam = qParameter.value
  watch(() => qParameter.value, newParam => {
    console.log('questionParameters changed')
    if (newParam && newParam !== prevQuestionParam) {
      val.value = JSON.parse(newParam.val)
    }
  })
  return { val, loading, update, error }
}
