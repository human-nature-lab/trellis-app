<template>
  <v-text-field
    v-model="text"
    auto-grow
    full-width
    placeholder="Your text here..."
    textarea
    :disabled="isQuestionDisabled"
    />
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'text-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, VuetifyValidationRules],
    data: function () {
      return {
        newText: null,
        oldText: null
      }
    },
    computed: {
      text: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : ''
        },
        set: function (val) {
          actionBus.actionDebounce({
            action_type: 'set-text',
            question_id: this.question.id,
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
