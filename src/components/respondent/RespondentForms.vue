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
        <FormsView
          v-if="forms"
          :forms="forms"
          @click="startInterview"/>
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import FormsView from '../FormsView'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import SurveyService from '../../services/survey'
  import FormService from '../../services/form/FormService'
  import RespondentService from '../../services/respondent/RespondentService'
  import InterviewService from '../../services/interview/InterviewService'
  import global from '../../static/singleton'
  import router from '../../router'
  import Vue from 'vue'
  import Survey from '../../entities/trellis/Survey'
  import StudyForm from '../../entities/trellis/StudyForm'
  import Respondent from '../../entities/trellis/Respondent'
  import Translation from '../../entities/trellis/Translation'

  export class DisplayForm {
    constructor (
      public id: string,
      public nameTranslation: Translation,
      public surveys: Survey[],
      public isComplete?: boolean,
      public isStarted?: boolean,
      public nComplete?: number
    ) {}
  }

  interface RespondentFormsData {
    respondent: Respondent,
    surveys: Survey[],
    forms: StudyForm[]
  }

  async function load (to) {
    let respondentId = to.params.respondentId
    let studyId = to.params.studyId
    return {
      respondent: await RespondentService.getRespondentById(respondentId),
      surveys: await SurveyService.getRespondentSurveys(studyId, respondentId),
      forms: await FormService.getStudyForms(studyId)
    }
  }

  export default Vue.extend({
    name: 'respondent-forms',
    mixins: [RouteMixinFactory(load)],
    data () {
      return {
        global: global,
        forms: [] as DisplayForm[],
        respondent: null as Respondent,
        error: ''
      }
    },
    // head: {
    //     title () {
    //       return {
    //         inner: `${this.respondent.name} Forms`
    //       }
    //     }
    // },
    components: {
      FormsView
    },
    methods: {
      async startInterview (form: DisplayForm) {
        if (form.isComplete) return
        let interview
        try {
          if (form.isStarted) {
            interview = await InterviewService.create(form.surveys[0].id)
          } else {
            let survey = await SurveyService.create(this.global.study.id, this.respondent.id, form.id)
            interview = await InterviewService.create(survey.id)
          }
          router.push({name: 'Interview', params: {studyId: this.global['study'].id, interviewId: interview.id}})
        } catch (err) {
          this.error = err
        }
      },
      hydrate (data: RespondentFormsData) {
        // Join any surveys that have been created with the possible forms
        data.forms.sort((a, b) => {
          return a.sortOrder - b.sortOrder
        })
        let forms: DisplayForm[] = data.forms.filter((studyForm: StudyForm) => {
          return studyForm.form.isPublished // TODO: Filter out any forms that the respondent does not qualify for
        }).map((studyForm: StudyForm) => {
          let formSurveys = data.surveys.filter((survey: Survey) => survey.formId === studyForm.formMasterId)
          return new DisplayForm(studyForm.formMasterId, studyForm.form.nameTranslation, formSurveys)
        })
        this.respondent = data.respondent
        this.forms.push(...forms)
      }
    }
  })
</script>

<style scoped>

</style>
