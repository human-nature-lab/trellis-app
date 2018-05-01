<template>
  <v-time-picker
    landscape
    v-model="time"
    :disable="isQuestionDisabled"/>
</template>

<script>
  import actionBus from '../services/ActionBus'
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  export default {
    name: 'time-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin],
    computed: {
      time: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : null
        },
        set: function (val) {
          actionBus.action({
            action_type: 'set-time',
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
