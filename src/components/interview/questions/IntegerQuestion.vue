<template>
  <v-flex class="integer-question">
    <v-text-field
      :disabled="isQuestionDisabled"
      v-model.number="value"
      type="number"
      :step="1"></v-text-field>
  </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'integer-question',
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
