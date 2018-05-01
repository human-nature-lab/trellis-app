<template>
    <v-date-picker
      v-model="date"
      reactive
      landscape
      :disabled="isQuestionDisabled"/>
</template>

<script>
  import actionBus from '../services/ActionBus'
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  export default {
    name: 'date-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    computed: {
      date: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : null
        },
        set: function (val) {
          actionBus.action({
            action_type: 'set-date',
            question_datum_id: this.question.id,
            payload: {
              val: val
            }
          })
        }
      }
    },
    mixins: [QuestionDisabledMixin]
  }
</script>

<style scoped>

</style>
