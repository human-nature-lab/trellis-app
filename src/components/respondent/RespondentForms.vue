<template>
  <v-flex xs12 class="respondent-forms">
    <v-container fluid>
      <v-alert v-if="error">{{ error }}</v-alert>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>
            {{ $t('respondent_forms', [respondent.name]) }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-on="on" v-bind="attrs" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="showHidden = !showHidden">
                <v-list-item-action>
                  <v-icon v-if="showHidden">mdi-check</v-icon>
                </v-list-item-action>
                <v-list-item-title>{{ $t('show_all') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <forms-view
          v-if="forms"
          :forms="standardForms"
          :respondent="respondent"
          :showHidden="showHidden"
          :showUnpublished="showUnpublished || isTestStudy"
          :allowMultipleSurveys="false"
          @newInterview="startInterview"
        >
        </forms-view>
      </v-card>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>{{ $t('census_forms') }}</v-toolbar-title>
        </v-toolbar>
        <forms-view
          v-if="censusForms"
          :forms="censusForms"
          :respondent="respondent"
          :canCreateSurveys="true"
          :showUnpublished="showUnpublished || isTestStudy"
          @newInterview="startInterview"
        >
        </forms-view>
      </v-card>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import DocsLinkMixin from "../../mixins/DocsLinkMixin";
  import FormsView from "./FormsView.vue";
  import RoutePreloadMixin from "../../mixins/RoutePreloadMixin";
  import SurveyService from "../../services/survey";
  import FormService from "../../services/form/FormService";
  import RespondentService from "../../services/respondent/RespondentService";
  import global from "../../static/singleton";
  import Vue from "vue";
  import Survey from "../../entities/trellis/Survey";
  import StudyForm from "../../entities/trellis/StudyForm";
  import Respondent from "../../entities/trellis/Respondent";
  import Translation from "../../entities/trellis/Translation";
  import SkipService from "../../services/SkipService";
  import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag";
  import { routeQueue } from "../../router";
  import Interview from "../../entities/trellis/Interview";

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

  async function load(to): Promise<object> {
    let respondentId = to.params.respondentId;
    let studyId = to.params.studyId;
    
    const [respondent, surveys, forms] = await Promise.all([
      RespondentService.getRespondentById(respondentId),
      SurveyService.getRespondentSurveys(studyId, respondentId),
      FormService.getStudyForms(studyId),
    ]);
    const conditionTags = await respondent.respondentConditionTags;
    return {
      conditionTags,
      respondent,
      surveys,
      forms,
    };
  }

  export default Vue.extend({
    name: 'respondent-forms',
    mixins: [
      RoutePreloadMixin(load),
      DocsLinkMixin('./respondents/RespondentForms.md'),
    ],
    data() {
      return {
        global,
        surveys: [] as Survey[],
        forms: [] as StudyForm[],
        respondent: null as Respondent,
        conditionTags: [] as RespondentConditionTag[],
        showHidden: false,
        showUnpublished: false,
        error: '',
      };
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
        this.forms = data.forms
        this.conditionTags = data.conditionTags
        this.surveys = data.surveys
        this.respondent = data.respondent;
      },
    },
    computed: {
      isTestStudy(): boolean {
        return !!(this.global.study && this.global.study.testStudyId)
      },
      censusForms (): DisplayForm[] {
        return this.displayForms.filter(f => f.censusTypeId)
      },
      standardForms (): DisplayForm[] {
        return this.displayForms.filter(f => !f.censusTypeId)
      },
      displayForms (): DisplayForm[] {
        const tagSet: Set<string> = new Set(
          this.conditionTags.map((c: RespondentConditionTag) => {
            return c.conditionTag.name
          })
        )
        return this.forms.map((studyForm: StudyForm) => {
          let formSurveys = this.surveys.filter(
            (survey: Survey) => survey.formId === studyForm.currentVersionId
          );
          
          const isSkipped = SkipService.shouldSkip(
            studyForm.form.skips,
            tagSet,
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
        })
      }
    },
  });
</script>
