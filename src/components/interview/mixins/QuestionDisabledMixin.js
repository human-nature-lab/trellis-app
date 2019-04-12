export default {
  props: {
    disabled: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    isQuestionDisabled: function () {
      if (this.disabled) {
        return true
      } else if (this.question && this.question.datum) {
        return this.question.datum.dkRf != null
      }
    }
  }
}
