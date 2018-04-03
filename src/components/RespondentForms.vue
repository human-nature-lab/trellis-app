<template>
  <v-flex class="respondent-forms">
    <v-progress-linear :active="anyValueMatches(loading, true)" indeterminate height="2"></v-progress-linear>
    <v-container>
      <v-flex>
        <h3>Respondent: {{respondent.name}}</h3>
      </v-flex>
      <FormsView v-if="forms" :forms="forms"></FormsView>
    </v-container>
  </v-flex>
</template>

<script>
  import FormsView from './FormsView'
  import { SurveyService } from '@/services/survey/SurveyService'
  import { FormService } from '@/services/form/FormService'
  import { RespondentService } from '@/services/respondent/RespondentService'
  export default {
    name: 'respondent-forms',
    data: function () {
      return {
        forms: null,
        loading: {
          respondent: true,
          forms: true
        },
        respondent: null,
        respondentId: this.$route.params.respondentId,
        studyId: this.$route.params.studyId
      }
    },
    mounted: function () {
      this.loadRespondent()
      this.loadRespondentForms()
    },
    components: {
      FormsView
    },
    methods: {
      loadRespondent: function () {
        this.loading.respondent = true
        return RespondentService.getRespondentById(this.respondentId)
          .then(respondent => {
            this.respondent = respondent
            this.loading.respondent = false
          })
          .catch(err => {
            this.loading.respondent = false
            this.error = err
          })
      },
      loadRespondentForms: function () {
        this.loading.forms = true
        return Promise.all([
          SurveyService.getRespondentSurveys(this.studyId, this.respondentId),
          FormService.getStudyForms(this.studyId)
        ]).then(combined => {
          let [surveys, forms] = combined
          this.loading.forms = false

          // Join any surveys that have been created with the possible forms
          this.forms = forms.filter(form => {
            return form.is_published === '1' || form.is_published === 1 || form.is_published === true // TODO: Filter out any forms that the repspondent does not qualify for
          }).map(form => {
            let survey = surveys.find(survey => survey.form_id === form.id)
            if (survey) {
              form.survey = survey
            }
            return form
          })
        })
        .catch(err => {
          this.loading.forms = false
          this.error = err
          throw err
        })
      }
    }
  }
</script>

<style scoped>

</style>
