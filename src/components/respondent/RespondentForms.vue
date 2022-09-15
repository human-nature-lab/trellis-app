<template>
  <v-container class="respondent-forms fill-width">
    <v-alert v-if="error">
      {{ error }}
    </v-alert>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title v-if="respondent">
          {{ $t('respondent_forms', [respondent.name]) }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="respondent"
          exact
          icon
          text
          :to="{ name: 'Respondent', params: { studyId: global.study.id, respondentId: respondent.id } }"
        >
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              icon
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="showHidden = !showHidden">
              <v-list-item-action>
                <v-icon v-if="showHidden">
                  mdi-check
                </v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t('show_skipped') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showUnpublished = !showUnpublished">
              <v-list-item-action>
                <v-icon v-if="showUnpublished">
                  mdi-check
                </v-icon>
              </v-list-item-action>
              <v-list-item-title>{{ $t('show_unpublished') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>
      <FormsView
        v-if="forms"
        :forms="respondentForms"
        :loading="loading"
        :disabled="loading"
        @update:forms="rehydrate"
        :respondent="respondent"
        :show-hidden="showHidden"
        :show-unpublished="showUnpublished"
        :allow-multiple-surveys="false"
        @newInterview="startInterview"
      />
    </v-card>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>{{ $t('census_forms') }}</v-toolbar-title>
      </v-toolbar>
      <forms-view
        v-if="censusForms"
        :loading="loading"
        :disabled="loading"
        :forms="censusForms"
        @update:forms="rehydrate"
        :respondent="respondent"
        :can-create-surveys="true"
        @newInterview="startInterview"
      />
    </v-card>
  </v-container>
</template>

<script lang="ts">
import DocsLinkMixin from '../../mixins/DocsLinkMixin'
import FormsView from './FormsView.vue'
import RoutePreloadMixin from '../../mixins/RoutePreloadMixin'
import SurveyService from '../../services/survey'
import FormService from '../../services/form'
import RespondentService from '../../services/respondent'
import global from '../../static/singleton'
import Vue from 'vue'
import Survey from '../../entities/trellis/Survey'
import StudyForm from '../../entities/trellis/StudyForm'
import Respondent from '../../entities/trellis/Respondent'
import SkipService from '../../services/SkipService'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import { routeQueue } from '../../router'
import Interview from '../../entities/trellis/Interview'
import { DisplayForm } from './FormListItem.vue'

interface RespondentFormsData {
  respondent: Respondent
  surveys: Survey[]
  forms: StudyForm[]
  conditionTags: RespondentConditionTag[]
}

async function load (to): Promise<object> {
  const respondentId = to.params.respondentId
  const studyId = to.params.studyId

  const [respondent, surveys, forms] = await Promise.all([
    RespondentService.getRespondentById(respondentId),
    SurveyService.getRespondentSurveys(studyId, respondentId),
    FormService.getStudyForms(studyId),
  ])
  const conditionTags = await respondent.respondentConditionTags
  return {
    conditionTags,
    respondent,
    surveys,
    forms,
  }
}

const skipService = new SkipService()

export default Vue.extend({
  name: 'RespondentForms',
  mixins: [
    RoutePreloadMixin(load),
    DocsLinkMixin('./respondents/RespondentForms.md'),
  ],
  data () {
    return {
      global,
      surveys: [] as Survey[],
      forms: [] as StudyForm[],
      respondent: null as Respondent,
      conditionTags: [] as RespondentConditionTag[],
      showHidden: false,
      showUnpublished: false,
      skipService: new SkipService(),
      error: '',
      loading: false,
    }
  },
  components: {
    FormsView,
  },
  methods: {
    async startInterview (interview: Interview) {
      routeQueue.replaceAndReturnToCurrent({
        name: 'Interview',
        params: { studyId: this.global.study.id, interviewId: interview.id },
      })
    },
    async rehydrate () {
      this.loading = true
      this.hydrate(await load(this.$route))
    },
    hydrate (data: RespondentFormsData) {
      // Join any surveys that have been created with the possible forms
      data.forms.sort((a, b) => {
        return a.sortOrder - b.sortOrder
      })
      skipService.clear()
      for (const f of data.forms) {
        if (f.form.skips && f.form.skips.length) {
          skipService.register(f.form.skips)
        }
      }
      this.conditionTags = data.conditionTags
      this.surveys = data.surveys
      this.forms = data.forms
      this.respondent = data.respondent
      this.loading = false
    },
  },
  computed: {
    displayForms (): DisplayForm[] {
      return this.forms.map((studyForm: StudyForm) => {
        const formSurveys = this.surveys.filter(
          (survey: Survey) => survey.form.formMasterId === studyForm.formMasterId,
        )
        const conditionTags: Set<string> = new Set(
          this.conditionTags.map((c: RespondentConditionTag) => {
            return c.conditionTag.name
          }),
        )
        const isSkipped = skipService.shouldSkip(
          studyForm.form.skips,
          conditionTags,
        )
        const showForm = !isSkipped || this.showHidden
        return {
          id: studyForm.currentVersionId,
          nameTranslation: studyForm.form.nameTranslation,
          surveys: formSurveys,
          isPublished: studyForm.form.isPublished,
          isSkipped: !showForm,
          censusTypeId: studyForm.censusTypeId,
          isComplete: false,
          isStarted: formSurveys.length > 0,
          nComplete: 0,
          version: studyForm.form.version,
        } as DisplayForm
      })
    },
    censusForms (): DisplayForm[] {
      return this.displayForms.filter(f => f.censusTypeId)
    },
    respondentForms (): DisplayForm[] {
      return this.displayForms.filter(f => !f.censusTypeId)
    },
  },
})
</script>
