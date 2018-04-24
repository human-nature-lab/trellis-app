<template>
    <v-flex>
      <v-text-field
        :disabled="isQuestionDisabled"
        v-model.number="value"
        placeholder="decimal"
        type="number"
      ></v-text-field>
    </v-flex>
</template>

<script>
  // TODO: It might be required to use https://github.com/text-mask/text-mask/tree/master/core to support decimal type
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'decimal-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin],
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
          actionBus.actionDebounce({
            action_type: 'number-change',
            question_datum_id: this.question.datum.id,
            payload: {
              val: val
            }
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
