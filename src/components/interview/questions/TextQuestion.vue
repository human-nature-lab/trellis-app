<template>
  <v-text-field
    v-model="text"
    auto-grow
    full-width
    :placeholder="$t('text_placeholder')"
    textarea
    :disabled="isQuestionDisabled"
    />
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import VuetifyValidationRules from '../mixins/VuetifyValidationRules'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  export default {
    name: 'text-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, VuetifyValidationRules, ActionMixin],
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
          this.action(AT.set_text, {
            val: val
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
