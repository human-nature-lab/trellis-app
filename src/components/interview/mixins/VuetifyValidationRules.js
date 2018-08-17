import { makeValidationRules } from '../services/ValidatorService'
import Vue from 'vue'

export default Vue.extend({
  computed: {
    rules () {
      return makeValidationRules(this.question, this.question.questionParameters)
    }
  }
})
