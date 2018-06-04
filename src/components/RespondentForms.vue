<template>
  <v-flex class="respondent-forms">
    <v-container>
      <v-flex>
        <h3>Forms for: {{respondent.name}}</h3>
      </v-flex>
      <FormsView v-if="forms" :forms="forms"  />
    </v-container>
  </v-flex>
</template>

<script>
  import FormsView from './FormsView'
  import SurveyService from '@/services/survey/SurveyService'
  import FormService from '@/services/form/FormService'
  import RespondentService from '@/services/respondent/RespondentService'
  import singleton from '../singleton'

  let data = {}
  function load (respondentId, studyId) {
    singleton.loading.active = true
    singleton.loading.step = 0
    singleton.loading.steps = 4
    singleton.loading.message = 'Loading respondent metadata and forms...'
    return Promise.all([
      RespondentService.getRespondentById(respondentId)
        .then(respondent => {
          singleton.loading.step++
          data.respondent = respondent
        })
        .catch(err => {
          data.error = err
        }),
      Promise.all([
        SurveyService.getRespondentSurveys(studyId, respondentId),
        FormService.getStudyForms(studyId)
      ]).then(combined => {
        let [surveys, forms] = combined
        // Join any surveys that have been created with the possible forms
        forms = forms.filter(form => {
          return form.is_published === '1' || form.is_published === 1 || form.is_published === true // TODO: Filter out any forms that the respondent does not qualify for
        }).map(form => {
          let survey = surveys.find(survey => survey.form_id === form.id)
          if (survey) {
            form.survey = survey
          }
          return form
        })
        forms.sort((a, b) => {
          return a.sort_order - b.sort_order
        })
        data.forms = forms
      })
    ]).then(() => {
      singleton.loading.active = false
    })
  }

  export default {
    name: 'respondent-forms',
    data: function () {
      return {
        forms: {},
        respondent: {},
        error: null
      }
    },
    beforeRouteEnter (to, from, next) {
      load(to.params.respondentId, to.params.studyId).then(next)
    },
    beforeRouteUpdate (to, from, next) {
      load(to.params.respondentId, to.params.studyId).then(next).then(this.hydrate)
    },
    created: function () {
      this.hydrate()
    },
    components: {
      FormsView
    },
    methods: {
      hydrate: function () {
        this.respondent = data.respondent
        this.respondentId = data.respondent.id
        this.forms = data.forms
        this.error = data.error
      }
    }
  }
</script>

<style scoped>

</style>
