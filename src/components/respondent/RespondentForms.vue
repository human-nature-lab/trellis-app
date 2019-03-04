<template>
  <v-flex xs12 class="respondent-forms">
    <v-container fluid>
      <v-alert v-if="error">{{ error }}</v-alert>
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
            </v-list>
          </v-menu>
        </v-toolbar>
        <forms-view
          v-if="forms"
          :forms="forms"
          :respondent="respondent"
          :showHidden="showHidden"
          :showUnpublished="showUnpublished"
          :allowMultipleSurveys="false"
          @newInterview="startInterview">
        </forms-view>
      </v-card>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>{{$t('census_forms')}}</v-toolbar-title>
        </v-toolbar>
        <forms-view
          v-if="censusForms"
          :forms="censusForms"
          :respondent="respondent"
          :canCreateSurveys="true"
          @newInterview="startInterview">
        </forms-view>
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import FormsView from './FormsView'
  import RouteMixinFactory from '../../mixins/RoutePreloadMixin'
  import SurveyService from '../../services/survey'
  import FormService from '../../services/form/FormService'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import Vue from 'vue'
  import Survey from '../../entities/trellis/Survey'
  import StudyForm from '../../entities/trellis/StudyForm'
  import Respondent from '../../entities/trellis/Respondent'
  import Translation from '../../entities/trellis/Translation'
  import SkipService from "../../services/SkipService"
  import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag"
  import {pushRouteAndQueueCurrent} from '../../router'
  import Interview from '../../entities/trellis/Interview'

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
      public censusTypeId: string
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
        censusForms: [] as DisplayForm[],
        respondent: null as Respondent,
        conditionTags: [] as RespondentConditionTag[],
        showHidden: false,
        showUnpublished: false,
        error: ''
      }
    },
    components: {
      FormsView
    },
    methods: {
      async startInterview (interview: Interview) {
        pushRouteAndQueueCurrent({name: 'Interview', params: {studyId: this.global['study'].id, interviewId: interview.id}})
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
          return new DisplayForm(studyForm.formMasterId, studyForm.form.nameTranslation, formSurveys, studyForm.form.isPublished, isSkipped, studyForm.censusTypeId)
        })
        this.respondent = data.respondent
        this.censusForms = forms.filter(f => f.censusTypeId)
        this.forms = forms.filter(f => !f.censusTypeId)
      }
    }
  })
</script>

<style scoped>

</style>
