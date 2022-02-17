import Vue, { PropOptions } from 'vue'
import Question from '../entities/trellis/Question'

export default Vue.extend({
  inject: ['builder'],
  computed: {
    questions (): Record<string, Question> {
      const m = {}
      if (!this.builder || !this.builder.form) {
        return m
      }
      for (const section of this.builder.form.sections) {
        for (const page of section.questionGroups) {
          for (const question of page.questions) {
            m[question.id] = question
          }
        }
      }
      return m
    }
  }
})