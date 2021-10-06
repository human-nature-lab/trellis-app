<template>
  <v-flex xs12 class="geo-forms">
    <v-container fluid>
      <v-alert v-if="error">{{ error }}</v-alert>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            <AsyncTranslationText
              :translation="geo.nameTranslation" />
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="showHidden=!showHidden">
                <v-list-item-action>
                  <v-icon v-if="showHidden">mdi-check</v-icon>
                </v-list-item-action>
                <v-list-item-title>{{$t('show_all')}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <forms-view
          v-if="forms"
          :forms="forms"
          :geo="geo"
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
          :geo="geo"
          :canCreateSurveys="true"
          @newInterview="startInterview">
        </forms-view>
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import FormsView from '../respondent/FormsView.vue'
  import RoutePreloadMixin from '../../mixins/RoutePreloadMixin'
  import SurveyService from '../../services/survey'
  import FormService from '../../services/form/FormService'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import Vue from 'vue'
  import Survey from '../../entities/trellis/Survey'
  import StudyForm from '../../entities/trellis/StudyForm'
  import Geo from '../../entities/trellis/Geo'
  import Translation from '../../entities/trellis/Translation'
  import SkipService from '../../services/SkipService'
  import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
  import { routeQueue } from '../../router'
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

  interface GeoFormsData {
    geo: Geo,
    surveys: Survey[],
    forms: StudyForm[],
    conditionTags: RespondentConditionTag[]
  }

  async function load (to): Promise<object> {
    let geoId = to.params.geoId
    let studyId = to.params.studyId
    const [geo, surveys] = await Promise.all([
      GeoService.getGeoById(geoId),
      SurveyService.getGeoSurveys(studyId, geoId),
    ])
    const forms = await FormService.getGeoTypeForms(studyId, geo.geoTypeId)
    // TODO: consider GeoConditionTags
    const conditionTags = []
    return {
      conditionTags,
      geo,
      surveys,
      forms
    }
  }

  export default Vue.extend({
    name: 'geo-forms',
    mixins: [RoutePreloadMixin(load), DocsLinkMixin('./locations/GeoForms.md')],
    data () {
      return {
        global,
        forms: [] as DisplayForm[],
        censusForms: [] as DisplayForm[],
        geo: null as Geo,
        conditionTags: [] as RespondentConditionTag[],
        showHidden: false,
        showUnpublished: false,
        error: ''
      }
    },
    components: {
      AsyncTranslationText,
      FormsView
    },
    methods: {
      async startInterview (interview: Interview) {
        routeQueue.replaceAndReturnToCurrent({ name: 'Interview', params: { studyId: this.global['study'].id, interviewId: interview.id } })
      },
      hydrate (data: GeoFormsData) {
          // Join any surveys that have been created with the possible forms
        data.forms.sort((a, b) => {
          return a.sortOrder - b.sortOrder
        })
        const forms: DisplayForm[] = data.forms.map((studyForm: StudyForm) => {
          let formSurveys = data.surveys.filter((survey: Survey) => survey.formId === studyForm.formMasterId)
          // TODO:Empty for now
          const conditionTags: Set<string> = new Set()
          const isSkipped = SkipService.shouldSkip(studyForm.form.skips, conditionTags)
          return new DisplayForm(studyForm.formMasterId, studyForm.form.nameTranslation, formSurveys, studyForm.form.isPublished, isSkipped, studyForm.censusTypeId)
        })
        this.geo = data.geo
        this.censusForms = forms.filter(f => f.censusTypeId)
        this.forms = forms.filter(f => !f.censusTypeId)
      }
    }
  })
</script>
