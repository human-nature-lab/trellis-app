import { computed } from 'vue'
import { useBuilder } from './injected.helper'
import Question from '@/entities/trellis/Question'

export function useBuilderQuestions () {
  const builder = useBuilder()
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
