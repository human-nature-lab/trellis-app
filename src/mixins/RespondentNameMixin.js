export default {
  created () {
    if (!this.respondent) {
      throw new Error('Respondent must be defined to use the RespondentNameMixin')
    } else if (!this.respondent.names || !this.respondent.names.length) {
      throw new Error('Respondent names must be defined to use the RespondentNameMixin')
    }
  },
  computed: {
    respondentName () {
      return this.respondent.names.find(n => n.is_display_name).name
    }
  }
}
