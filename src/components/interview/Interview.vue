<template>
  <v-container fluid fill-height class="ma-0 pa-0">
    <v-layout column>
      <v-toolbar flat>
        <v-toolbar-title>
          <AsyncTranslationText
            v-if="section"
            :translation="section.nameTranslation"
            :locale="global.locale" />
          <span class="subheading light">
            ({{$t('page')}} {{location.page + 1}})
          </span>
          <span
            class="subheading light"
            v-if="isRepeated">
            ({{$t('repetition')}} {{currentRepetition + 1}})
          </span>
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
              :isAtBeginning="isAtBeginning"
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
  import AsyncTranslationText from '../AsyncTranslationText'
  import menuBus from '../main-menu/MenuBus'
  import global from '../../static/singleton'

  import {sharedInterview, clearSharedInterview} from './classes/InterviewManager'
  import InterviewService from '../../services/interview/InterviewService'
  import actionBus from './services/actions/ActionBus'

  import {validateParametersWithError} from './services/ValidatorService'
  import router, {replaceWithNextOr} from '../../router'
  import InterviewLoader from './services/InterviewLoader'
  import SurveyService from '../../services/survey'

  let interviewState
  export default {
    name: 'interview',
    mixins: [RoutePreloadMixin(InterviewLoader.load, true)],
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
        isAtEnd: false,
        isAtBeginning: false,
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
        section: null
      }
    },
    errorCaptured (err, vm, info) {
      try {
        if (err) {
          if (!err.interviewId) {
            err.interviewId = this.interview.id
          }
        }
        this.log(err)
        this.alert('error', info, {timeout: 0})
      } catch (nerr) {
        console.error(nerr)
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
        this.initializeInterview(data)
      },
      initializeInterview: function (d) {
        let {actions, form, baseRespondentConditionTags, conditionTags, data, interview, respondentFills} = d
        clearSharedInterview()
        this.dialog.end = false
        this.dialog.beginning = false
        this.dialog.conditionTag = false
        this.location = null
        this.interviewConditionTags = null
        this.interviewData = null
        this.interviewActions = null
        interviewState = sharedInterview(interview, form, actions, data, conditionTags, respondentFills, baseRespondentConditionTags)
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
        this.form = form
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
        this.isAtEnd = interviewState.navigator.isAtEnd
        this.isAtBeginning = interviewState.navigator.isAtStart
        this.location = interviewState.location
        this.section = interviewState.navigator.currentSection()
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
      async lockAndExit () {
        try {
          await this.saveData()
          await this.completeInterview()
          await this.completeSurvey()
          this.dialog.end = false
          this.exit()
        } catch (err) {
          this.log(err)
          this.error = err
        }
      },
      redirectToComplete (interviewId) {
        router.replace({name: 'SurveyComplete', params: {surveyId: this.interview.surveyId}})
      },
      exit () {
        this.alreadyExited = true
        replaceWithNextOr(() => {
          this.redirectToComplete()
        })
      },
      async saveData () {
        if (this.formIsEmpty || this.isSaving) {
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
        const dialogText = this.$t('survey_message_exit')
        e.returnValue = dialogText
        return dialogText
      }
    },
    computed: {
      formIsEmpty () {
        return !(this.form && this.form.sections && this.form.sections.length)
      },
      isRepeated () {
        return this.section && (this.section.isRepeatable || this.section.followUpQuestionId !== null)
      },
      currentRepetition () {
        return this.section.isRepeatable ? this.location.sectionRepetition : this.location.sectionFollowUpRepetition
      }
    },
    components: {
      Page,
      ConditionTagList,
      AsyncTranslationText
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
