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
  export default {
    name: 'integer-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, VuetifyValidationRules, ActionMixin],
    data: function () {
      return {
        _value: null
      }
    },
    computed: {
      value: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : this._value
        },
        set: function (val) {
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
