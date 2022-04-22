<template>
  <v-flex
    xs12
    class="respondent-forms"
  >
    <v-container fluid>
      <v-alert v-if="error">
        {{ error }}
      </v-alert>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('respondent_forms', [respondent.name]) }}
          </v-toolbar-title>
          <v-spacer />
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
                <v-list-item-title>{{ $t('show_all') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <forms-view
          v-if="forms"
          :forms="forms"
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
          :forms="censusForms"
          :respondent="respondent"
          :can-create-surveys="true"
          @newInterview="startInterview"
        />
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import DocsLinkMixin from '../../mixins/DocsLinkMixin'
import FormsView from './FormsView.vue'
import RoutePreloadMixin from '../../mixins/RoutePreloadMixin'
import SurveyService from '../../services/survey'
import FormService from '../../services/form/FormService'
import RespondentService from '../../services/respondent'
import global from '../../static/singleton'
import Vue from 'vue'
import Survey from '../../entities/trellis/Survey'
import StudyForm from '../../entities/trellis/StudyForm'
import Respondent from '../../entities/trellis/Respondent'
import Translation from '../../entities/trellis/Translation'
import SkipService from '../../services/SkipService'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import { routeQueue } from '../../router'
import Interview from '../../entities/trellis/Interview'

export type DisplayForm = {
    isComplete?: boolean;
    isStarted?: boolean;
    nComplete?: number;
    id: string;
    nameTranslation: Translation;
    surveys: Survey[];
    isPublished: boolean;
    isSkipped: boolean;
    censusTypeId: string;
    version: number;
  };

  interface RespondentFormsData {
    respondent: Respondent;
    surveys: Survey[];
    forms: StudyForm[];
    conditionTags: RespondentConditionTag[];
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

export default Vue.extend({
  name: 'RespondentForms',
  mixins: [
    RoutePreloadMixin(load),
    DocsLinkMixin('./respondents/RespondentForms.md'),
  ],
  data () {
    return {
      global,
      forms: [] as DisplayForm[],
      censusForms: [] as DisplayForm[],
      respondent: null as Respondent,
      conditionTags: [] as RespondentConditionTag[],
      showHidden: false,
      showUnpublished: false,
      skipService: new SkipService(),
      error: '',
    }
  },
  components: {
    FormsView,
  },
  methods: {
    async startInterview(interview: Interview) {
      routeQueue.replaceAndReturnToCurrent({
        name: 'Interview',
        params: { studyId: this.global['study'].id, interviewId: interview.id },
      });
    },
    hydrate(data: RespondentFormsData) {
      // Join any surveys that have been created with the possible forms
      data.forms.sort((a, b) => {
        return a.sortOrder - b.sortOrder;
      });
      const censusForms = data.forms.filter(f => f.censusTypeId)
      console.log(data, censusForms)
      const forms: DisplayForm[] = data.forms.map((studyForm: StudyForm) => {
        let formSurveys = data.surveys.filter(
          (survey: Survey) => survey.formId === studyForm.currentVersionId
        );
        const conditionTags: Set<string> = new Set(
          data.conditionTags.map((c: RespondentConditionTag) => {
            return c.conditionTag.name;
          })
        );
        const isSkipped = SkipService.shouldSkip(
          studyForm.form.skips,
          conditionTags
        );
        return {
          id: studyForm.currentVersionId,
          nameTranslation: studyForm.form.nameTranslation,
          surveys: formSurveys,
          isPublished: studyForm.form.isPublished,
          isSkipped: isSkipped,
          censusTypeId: studyForm.censusTypeId,
          isComplete: false,
          isStarted: formSurveys.length > 0,
          nComplete: 0,
          version: studyForm.form.version,
        } as DisplayForm;
      });
      this.respondent = data.respondent;
      this.censusForms = forms.filter((f) => f.censusTypeId);
      this.forms = forms.filter((f) => !f.censusTypeId);
    },
  },
})
</script>
