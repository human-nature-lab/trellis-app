<template>
  <v-flex class="respondent-forms">
    <v-container fluid>
      <v-alert v-if="error">{{this.error}}</v-alert>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('respondent_forms', [respondent.name])}}
          </v-toolbar-title>
        </v-toolbar>
        <FormsView v-if="forms" :forms="forms" @click="startInterview"/>
      </v-card>
    </v-container>
  </v-flex>
</template>

<script>
  import FormsView from '../FormsView'
  import SurveyService from '@/services/survey/SurveyService'
  import FormService from '@/services/form/FormService'
  import RespondentService from '@/services/respondent/RespondentService'
  import singleton from '../../static/singleton'
  import InterviewService from '../../services/interview/InterviewService'
  import index from '../../router/index'

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
          let formSurveys = surveys.filter(survey => survey.form_id === form.id)
          if (formSurveys) {
            form.surveys = formSurveys
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
    }).catch(err => {
      this.error = err
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
    head: {
      title: function () {
        return {
          inner: `${this.respondent.name} Forms`
        }
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
      startInterview: function (form) {
        if (form.isComplete) return
        let p
        if (form.isStarted) {
          p = InterviewService.create(form.surveys[0].id)
        } else {
          p = SurveyService.create(this.global.study.id, this.respondent.id, form.id).then(survey => {
            return InterviewService.create(survey.id)
          })
        }
        return p.then(interview => {
          index.push({name: 'Interview', params: {studyId: this.global.study.id, interviewId: interview.id}})
        }).catch(err => {
          this.error = err
        })
      },
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
