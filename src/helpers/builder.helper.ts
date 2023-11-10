import ConditionTag from '@/entities/trellis/ConditionTag'
import Form from '@/entities/trellis/Form'
import GeoType from '@/entities/trellis/GeoType'
import Locale from '@/entities/trellis/Locale'
import Parameter from '@/entities/trellis/Parameter'
import Question from '@/entities/trellis/Question'
import QuestionType from '@/entities/trellis/QuestionType'
import { builder } from '@/symbols/builder'
import { ref, inject, provide, computed } from 'vue'

export type BuilderState = {
  form: Form
  locale?: Locale
  locked: boolean
  questionTypes: QuestionType[]
  parameters: Parameter[]
  conditionTags: ConditionTag[]
  geoTypes: GeoType[]
}

export function provideBuilder (builderState: BuilderState) {
  provide(builder, builderState)
}

export function useBuilder () {
  return inject(builder) as BuilderState
}

export function useBuilderQuestions () {
  return computed(() => {
    const m = {}
    const builder = useBuilder()
    if (!builder || !builder.form) {
      return m
    }
    for (const section of builder.form.sections) {
      for (const page of section.questionGroups) {
        for (const question of page.questions) {
          m[question.id] = question
        }
      }
    }
    return m
  })
}

export function useBuilderQuestionList () {
  const questions = useBuilderQuestions()
  return computed(() => Object.values(questions.value))
}
