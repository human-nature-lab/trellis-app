<template>
  <v-flex class="integer-question">
    <v-text-field
      :rules="rules"
      :disabled="isQuestionDisabled"
      v-model.number="value"
      type="number"
      :step="1" />
  </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  import Question from '../../../entities/trellis/Question'
  export default {
    name: 'integer-question',
    props: {
      question: {
        type: Question,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, VuetifyValidationRules, ActionMixin],
    data () {
      return {
        _value: null
      }
    },
    computed: {
      value: {
        get () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : this._value
        },
        set (val) {
          this._value = val
          this.action(AT.number_change, {
            val
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
