export default {
  computed: {
    isQuestionDisabled: function () {
      if (this.question && this.question.datum) {
        return this.question.datum.dkRf != null
      }
      return false
    }
  }
}
