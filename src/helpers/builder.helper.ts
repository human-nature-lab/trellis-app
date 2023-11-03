import { computed, inject } from 'vue'
import Question from '@/entities/trellis/Question'
import ConditionTag from '@/entities/trellis/ConditionTag'
import Form from '@/entities/trellis/Form'
import GeoType from '@/entities/trellis/GeoType'
import Parameter from '@/entities/trellis/Parameter'
import QuestionType from '@/entities/trellis/QuestionType'
import { builder } from '@/symbols/builder'

type BuilderState = {
  form?: Form,
  locale?: Locale,
  locked: boolean,
  questionTypes: QuestionType[],
  parameters: Parameter[],
  conditionTags: ConditionTag[],
  geoTypes: GeoType[],
}

export function useBuilderState () {
  return inject<BuilderState>(builder)
}

export function useBuilderQuestions () {
  const builder = useBuilderState()
  return computed(() => {
    const m: Record<string, Question> = {}
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
