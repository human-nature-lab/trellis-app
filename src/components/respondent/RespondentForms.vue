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
  // @ts-ignore
  import FormsView from '../FormsView'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import SurveyService from '../../services/survey/SurveyService'
  import FormService from '../../services/form/FormService'
  import RespondentService from '../../services/respondent/RespondentService'
  import InterviewService from '../../services/interview/InterviewService'
  import global from '../../static/singleton'
  import index from '../../router/index'

  async function load (to) {
    let respondentId = to.params.respondentId
    let studyId = to.params.studyId
    return {
      respondent: await RespondentService.getRespondentById(respondentId),
      surveys: await SurveyService.getRespondentSurveys(studyId, respondentId),
      forms: await FormService.getStudyForms(studyId)
    }
  }

  export default {
    name: 'respondent-forms',
    mixins: [RouteMixinFactory(load)],
    data () {
      return {
        global: global,
        forms: {},
        respondent: {},
        error: null
      }
    },
    head: {
        title () {
          return {
            inner: `${this.respondent.name} Forms`
          }
        }
    },
    components: {
      FormsView
    },
    methods: {
      startInterview (form) {
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
      hydrate (data) {
        // Join any surveys that have been created with the possible forms
        debugger
        data.forms = data.forms.filter(form => {
          return form.isPublished // TODO: Filter out any forms that the respondent does not qualify for
        }).map(form => {
          let formSurveys = data.surveys.filter(survey => survey.formId === form.id)
          if (formSurveys) {
            form['surveys'] = formSurveys
          }
          return form
        })
        data.forms.sort((a, b) => {
          return a.sortOrder - b.sortOrder
        })
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
