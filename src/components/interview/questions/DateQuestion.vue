<template>
    <v-date-picker
      v-model="date"
      reactive
      landscape
      :disabled="isQuestionDisabled"/>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  export default {
    name: 'date-question',
    mixins: [QuestionDisabledMixin, ActionMixin],
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
          this.action(AT.set_date, {
            val: val
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
