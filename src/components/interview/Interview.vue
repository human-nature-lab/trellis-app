<template>
  <v-container fluid fill-height class="ma-0 pa-0">
    <v-layout column>
      <v-toolbar flat>
        <v-toolbar-title>
          <TranslatedText :translation="sectionTranslation" :locale="global.locale" />
          <span class="subheading light">(Page {{pageNum}})</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-flex>
        <v-progress-linear
          v-if="isSaving"
          :indeterminate="true" />
        <span v-if="formIsEmpty">
          {{ $t('form_empty') }}
        </span>
        <Page v-else
              :questions="questions"
              :location="location"
              :actions="interviewActions"
              :data="interviewData"
              :isAtEnd="isAtEnd"
              :conditionTags="interviewConditionTags"
              :interview="interview" />
      </v-flex>
    </v-layout>
    <v-dialog
      v-model="dialog.beginning">
      <v-card>
        <v-card-title class="headline">
          {{ $t('survey_message_beginning') }}
        </v-card-title>
        <v-card-text>
          {{ $t('all_data_saved') }}
          <br>
          {{ $t('survey_message_exit') }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="dialog.beginning = false">
            {{ $t('cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="saveAndExit">
            {{ $t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog.end">
      <v-card>
        <v-card-title class="headline">
          {{ $t('survey_message_end' )}}
        </v-card-title>
        <v-card-text>
          {{ $t('all_data_saved') }}
          <br>
          {{ $t('survey_message_exit') }}
          <br>
          {{ $t('survey_message_lock') }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="dialog.end = false">
            {{ $t('cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="lockAndExit()">
            {{ $t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      content-class="condition-tag-dialog"
      transition="dialog-bottom-transition"
      scrollable
      full-width
      lazy
      v-model="dialog.conditionTag">
      <v-card tile>
        <v-toolbar
          card
          dark
          color="primary">
          <v-btn icon dark @click.native="dialog.conditionTag = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            {{ $t('conditions') }}
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <ConditionTagList :conditions="interviewConditionTags" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import RoutePreloadMixin from '../../mixins/RoutePreloadMixin'
  import Page from './Page'
  import ConditionTagList from './ConditionTagList'
  import TranslatedText from '../TranslatedText'
  import menuBus from '../main-menu/MenuBus'
  import global from '../../static/singleton'

  import {sharedInterview, clearSharedInterview} from './classes/InterviewManager'
  import InterviewService from '../../services/interview/InterviewService'
  import actionBus from './services/actions/ActionBus'

  import {validateParametersWithError} from './services/ValidatorService'
  import router, {moveToNextOr} from '../../router'
  import InterviewLoader from './services/InterviewLoader'
  import SurveyService from '../../services/survey'

  let interviewState
  export default {
    name: 'interview',
    mixins: [RoutePreloadMixin(InterviewLoader.load)],
    head: {
      title: function () {
        let d = {}
        if (this.type === 'preview') {
          d.inner = 'Form preview: ' + interviewState.blueprint.id
        } else if (this.interview.survey) {
          d.inner = `Interview with ${this.interview.survey.respondent.name}`
        }
        return d
      }
    },
    data () {
      return {
        global,
        artificiallyExtendLoadTime: false,
        formId: null,
        surveyId: null,
        isLoading: true,
        isSaving: false,
        showSafeToExitMessage: false,
        type: 'interview',
        interviewData: {},
        interviewActions: {},
        interviewConditionTags: {},
        interview: {},
        form: null,
        location: {
          section: 0,
          page: 0,
          sectionRepetition: 0,
          sectionFollowUpDatumRepetition: null,
          sectionFollowUpDatumId: null
        },
        dialog: {
          beginning: false,
          end: false,
          conditionTag: false
        },
        alreadyExited: false,
        questions: [],
        loadingStep: 0,
        sectionTranslation: null,
        pageNum: null
      }
    },
    created () {
      actionBus.$on('action', this.actionHandler)
      menuBus.$on('showConditionTags', this.showConditionTags)
      window.onbeforeunload = this.prematureExit
    },
    beforeDestroy: function () {
      window.onbeforeunload = null
      menuBus.$off('showConditionTags', this.showConditionTags)
      actionBus.$off('action', this.actionHandler)
    },
    methods: {
      // Called by RoutePreloadMixin
      async leaving () {
        if (!this.alreadyExited) {
          await this.saveData()
          await this.completeInterview()
          interviewState.destroy()
        }
        this.alreadyExited = false // For route updates
      },
      // Called by RoutePreloadMixin
      hydrate (data) {
        this.type = data.interviewType
        const d = data
        this.initializeInterview(d.interview, d.actions, d.data, d.conditionTags, d.form, d.respondentFills)
      },
      initializeInterview: function (interview, actions, data, conditionTags, formBlueprint) {
        clearSharedInterview()
        this.location = null
        this.interviewConditionTags = null
        this.interviewData = null
        this.interviewActions = null
        interviewState = sharedInterview(interview, formBlueprint, actions, data, conditionTags)
        if (this.type === 'interview') {
          interviewState.attachDataPersistSlave()
          interviewState.attachActionsPersistSlave()
        }
        interviewState.initialize()
        // Share the relevant parts of the interview with the view
        this.interviewData = interviewState.data.data
        this.interviewConditionTags = interviewState.data.conditionTags
        this.interviewActions = interviewState.actions.store
        this.interview = interview
        this.form = formBlueprint
        interviewState.on('atEnd', this.showEndDialog, this)
        interviewState.on('atBeginning', this.showBeginningDialog, this)
        this.updateInterview()
      },
      actionHandler (action) {
        if (!interviewState) {
          throw Error('Trying to push actions before interview has been initialized')
        }
        interviewState.pushAction(action)
        this.updateInterview()
      },
      updateInterview () {
        this.location = interviewState.location
        this.sectionTranslation = interviewState.navigator.currentSection().nameTranslation
        this.pageNum = interviewState.location.page
        console.log('recalculating page questions')
        // The reference to this.location needs to be here so that we have a dependency on this.location
        let questions = interviewState.getPageQuestions(
          this.location.section,
          this.location.sectionRepetition,
          this.location.sectionFollowUpDatumId,
          this.location.page
        )
        questions = questions.map(q => {
          q.type = {
            name: q.questionType.name
          }
          let validation = validateParametersWithError(q, q.questionParameters, q.datum)
          q.allParametersSatisfied = validation === true // Makes non-boolean types falsey
          q.validationError = typeof validation === 'string' ? validation : null
          q.isAnswered = false
          return q
        })
        this.questions = questions || []
      },
      showBeginningDialog () {
        this.dialog.beginning = true
      },
      showEndDialog () {
        this.dialog.end = true
      },
      showConditionTags () {
        this.dialog.conditionTag = true
      },
      lockAndExit () {
        this.saveData()
          .then(() => {
            return Promise.all([
              this.completeInterview(),
              this.completeSurvey()
            ])
          })
          .then(() => {
            this.dialog.end = false
            this.exit()
          })
          .catch(err => {
            this.error = err
          })
      },
      exit () {
        this.alreadyExited = true
        moveToNextOr(() => {
          router.go(-1)
        })
      },
      async saveData () {
        if (this.formIsEmpty) {
          return
        } else {
          this.isSaving = true
          await interviewState.save()
          this.isSaving = false
        }
      },
      async completeSurvey () {
        return await SurveyService.complete(this.interview.surveyId)
      },
      async completeInterview () {
        return await InterviewService.complete(this.interview.id)
      },
      async saveAndExit () {
        await this.saveData()
        await this.completeInterview()
        this.dialog.end = false
        this.exit()
      },
      prematureExit: function (e) {
        this.saveData().then(() => {
          this.showSafeToExitMessage = true
        })
        this.completeInterview()
        const dialogText = 'You have unsaved changes. Are you sure you want to leave?'
        e.returnValue = dialogText
        return dialogText
      }
    },
    computed: {
      isAtEnd: function () {
        // We do this just to have the dependency on this.location
        if (this.location.section > 0) {
          return interviewState.navigator.isAtEnd
        }
        return false
      },
      formIsEmpty () {
        return !(this.form && this.form.sections && this.form.sections.length)
      }
    },
    components: {
      Page,
      ConditionTagList,
      TranslatedText
    }
  }
</script>

<style lang="sass">
  .light
    color: grey
  .condition-tag-dialog
    max-height: 80%
    min-height: 50%
    position: absolute
    bottom: 0
    left: 0
    padding: 0
    margin: 0
    background-color: white
</style>
