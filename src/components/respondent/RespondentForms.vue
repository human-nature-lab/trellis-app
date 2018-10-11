<template>
  <v-flex class="respondent-forms">
    <v-container fluid>
      <v-alert v-if="error">{{this.error}}</v-alert>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('respondent_forms', [respondent.name])}}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu offset-y>
            <v-btn
              slot="activator"
              icon>
              <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile @click="showHidden=!showHidden">
                <v-list-tile-action>
                  <v-icon v-if="showHidden">check</v-icon>
                </v-list-tile-action>
                <v-list-tile-title>{{$t('show_all')}}</v-list-tile-title>
              </v-list-tile>
              <!--<v-list-tile @click="showUnpublished=!showUnpublished">-->
                <!--<v-list-tile-action>-->
                  <!--<v-icon v-if="showUnpublished">check</v-icon>-->
                <!--</v-list-tile-action>-->
                <!--<v-list-tile-title>{{$t('show_unpublished')}}</v-list-tile-title>-->
              <!--</v-list-tile>-->
            </v-list>
          </v-menu>
        </v-toolbar>
        <FormsView
          v-if="forms"
          :forms="forms"
          :showHidden="showHidden"
          :showUnpublished="showUnpublished"
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
  import Vue from 'vue'
  import Survey from '../../entities/trellis/Survey'
  import StudyForm from '../../entities/trellis/StudyForm'
  import Respondent from '../../entities/trellis/Respondent'
  import Translation from '../../entities/trellis/Translation'
  import SkipService from "../../services/SkipService"
  import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag"
  import {pushRouteAndQueueCurrent} from '../../router'
  // @ts-ignore
  import {getCurrentPosition} from '../LocationFinder'

  export class DisplayForm {
    public isComplete?: boolean
    public isStarted?: boolean
    public nComplete?: number
    constructor (
      public id: string,
      public nameTranslation: Translation,
      public surveys: Survey[],
      public isPublished: boolean,
      public isSkipped: boolean,
    ) {}
  }

  interface RespondentFormsData {
    respondent: Respondent,
    surveys: Survey[],
    forms: StudyForm[],
    conditionTags: RespondentConditionTag[]
  }

  function load (to): Promise<object> {
    let respondentId = to.params.respondentId
    let studyId = to.params.studyId
    let respondent, surveys, forms
    return Promise.all([
      RespondentService.getRespondentById(respondentId),
      SurveyService.getRespondentSurveys(studyId, respondentId),
      FormService.getStudyForms(studyId)
    ]).then(res => {
      [respondent, surveys, forms] = res
      return respondent.respondentConditionTags
    }).then(conditionTags => {
      return {
        conditionTags,
        respondent,
        surveys,
        forms
      }
    })
  }

  export default Vue.extend({
    name: 'respondent-forms',
    mixins: [RouteMixinFactory(load)],
    data () {
      return {
        global,
        forms: [] as DisplayForm[],
        respondent: null as Respondent,
        conditionTags: [] as RespondentConditionTag[],
        showHidden: false,
        showUnpublished: false,
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
        if (form.isComplete) {
          alert(`Can't reopen a form that has already been completed`)
          return
        }
        let interview
        this.global.loading.active = true
        let surveyId
        if (form.isStarted) {
          surveyId = form.surveys[0].id
        } else {
          try {
            let survey = await SurveyService.create(this.global.study.id, this.respondent.id, form.id)
            surveyId = survey.id
          } catch (err) {
            console.error(err)
            alert('Unable to create new survey')
          }
        }
        if (surveyId) {
          let coords: Coordinates
          try {
            coords = await getCurrentPosition()
          } catch (err) {
            console.error(err)
            alert('Error getting position: ' + err)
          }
          try {
            interview = await InterviewService.create(surveyId, coords)
            pushRouteAndQueueCurrent({name: 'Interview', params: {studyId: this.global['study'].id, interviewId: interview.id}})
          } catch (err) {
            this.error = err
            console.error(err)
            alert('Unable to create new interview on survey: ' + surveyId)
            alert(err)
          }
        }
        this.global.loading.active = false
      },
      hydrate (data: RespondentFormsData) {
          // Join any surveys that have been created with the possible forms
        data.forms.sort((a, b) => {
          return a.sortOrder - b.sortOrder
        })
        const forms: DisplayForm[] = data.forms.map((studyForm: StudyForm) => {
          let formSurveys = data.surveys.filter((survey: Survey) => survey.formId === studyForm.formMasterId)
          const conditionTags: Set<string> = new Set(data.conditionTags.map((c: RespondentConditionTag) => {
            return c.conditionTag.name
          }))
          const isSkipped = SkipService.shouldSkip(studyForm.form.skips, conditionTags)
          return new DisplayForm(studyForm.formMasterId, studyForm.form.nameTranslation, formSurveys, studyForm.form.isPublished, isSkipped)
        })
        this.respondent = data.respondent
        this.forms.push(...forms)
      }
    }
  })
</script>

<style scoped>

</style>
