<template>
  <v-time-picker
    :landscape="$vuetify.breakpoint.smAndUp"
    v-model="time"
    :disable="isQuestionDisabled"/>
</template>

<script>
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  export default {
    name: 'time-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, ActionMixin],
    computed: {
      time: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : null
        },
        set: function (val) {
          this.action(AT.set_time, {
            val
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
