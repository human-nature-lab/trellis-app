export default {
  computed: {
    isQuestionDisabled: function () {
      if (this.question && this.question.datum) {
        return this.question.datum.dk_rf !== null && this.question.datum.dk_rf !== undefined
      }
      return false
    }
  }
}
