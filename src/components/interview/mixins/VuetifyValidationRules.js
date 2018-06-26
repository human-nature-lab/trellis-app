import { makeValidationRules } from '../services/ValidatorService'

export default {
  computed: {
    rules: function () {
      return makeValidationRules(this.question, this.question.question_parameters)
    }
  }
}
