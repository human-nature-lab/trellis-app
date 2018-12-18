<template>
    <v-date-picker
      v-model="date"
      reactive
      landscape
      :locale="locale"
      :disabled="isQuestionDisabled">
    </v-date-picker>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  import global from '../../../static/singleton'

  export default {
    name: 'date-question',
    created () {
      this.locale = global.locale.languageTag
    },
    data () {
      return {
        locale: 'en-us'
      }
    },
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
