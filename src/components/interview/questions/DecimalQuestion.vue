<template>
    <v-flex class="decimal-question">
      <v-text-field
        :rules="rules"
        :disabled="isQuestionDisabled"
        v-model.number="value"
        :placeholder="$t('value')"
        type="number"
      ></v-text-field>
    </v-flex>
</template>

<script>
  // TODO: It might be required to use https://github.com/text-mask/text-mask/tree/master/core to support decimal type
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'

  export default {
    name: 'decimal-question',
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
          this.question.isAnswered = this.value !== null && this.value !== undefined
          this.debouncedAction(AT.number_change, {
            name: 'decimal',
            val: val
          })
        }
      }
    }
  }
</script>
