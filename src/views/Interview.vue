<template>
  <v-container
    fluid
    fill-height
    class="ma-0 pa-0 justify-start align-start trellis-interview"
  >
    <v-col>
      <v-toolbar
        flat
        dense
        class="flex-grow-0"
      >
        <v-toolbar-title>
          <AsyncTranslationText
            v-if="section"
            :translation="section.nameTranslation"
            :locale="global.locale"
          />
          <span class="subheading light">
            ({{ $t('page') }} {{ location ? location.page + 1 : '?' }})
          </span>
          <span
            class="subheading light"
            v-if="isRepeated"
          >
            ({{ $t('repetition') }} {{ currentRepetition + 1 }})
          </span>
        </v-toolbar-title>
      </v-toolbar>
      <ConditionAssignmentErrors
        v-if="conditionAssignmentErrors"
        :errors="conditionAssignmentErrors"
      />
      <v-flex v-if="!isLoading">
        <v-progress-linear
          v-if="isSaving"
          :indeterminate="true"
        />
        <span v-if="formIsEmpty">
          {{ $t('form_empty') }}
        </span>
        <Page
          v-else-if="location"
          :questions="questions"
          :location="location"
          :actions="interviewActions"
          :data="interviewData"
          :is-at-end="isAtEnd"
          :disabled="disableInput"
          :prev-active="navigation.prev"
          :next-active="navigation.next"
          :is-at-beginning="isAtBeginning"
          :condition-tags="interviewConditionTags"
          :interview="interview"
        />
      </v-flex>
    </v-col>
    <v-dialog
      v-model="dialog.beginning"
    >
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
            text
            color="error"
            @click="dialog.beginning = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            text
            color="success"
            @click="saveAndExit"
          >
            {{ $t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog.end"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t('survey_message_end' ) }}
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
            text
            color="error"
            @click="dialog.end = false"
          >
            {{ $t('cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            text
            color="success"
            @click="lockAndExit()"
          >
            {{ $t('confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      content-class="condition-tag-dialog"
      transition="dialog-bottom-transition"
      scrollable
      v-model="dialog.conditionTag"
    >
      <v-card tile>
        <v-toolbar
          card
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click.native="dialog.conditionTag = false"
          >
            <v-icon>mdi-close</v-icon>
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

<script lang="ts">
import { cloneDeep, merge } from 'lodash'
import Page from '@/components/interview/Page.vue'
import ConditionTagList from '@/components/interview/ConditionTagList.vue'
import AsyncTranslationText from '@/components/AsyncTranslationText.vue'
import ConditionAssignmentErrors from '@/components/interview/ConditionAssignmentErrors.vue'
import menuBus from '@/components/main-menu/MenuBus'
import global from '@/static/singleton'
import AT from '@/static/action.types'

import { sharedInterview, clearSharedInterview } from '@/components/interview/classes/InterviewManager'
import InterviewService from '@/services/interview'
import actionBus from '@/components/interview/services/actions/ActionBus'

import { allParametersAreValidWithError } from '@/components/interview/services/ValidatorService'
import { routeQueue } from '@/router'
import InterviewLoader from '@/components/interview/services/InterviewLoader'
import SurveyService from '@/services/survey'
import { locationsAreEqual } from '@/components/interview/services/InterviewAlligator'
import { computedTitle } from '@/router/history'
import Form from '@/entities/trellis/Form'
import TranslationService from '@/services/TranslationService'
import Respondent from '@/entities/trellis/Respondent'
import { onBeforeUnload } from '@/helpers/window.helper'
import { provideDataStore, provideManager } from '@/helpers/interview.helper'

function load (to) {
  return new Promise(async (resolve, reject) => {
    try {
      global.loading.active = true
      global.loading.indeterminate = true
      global.loading.fullscreen = true
      interviewData = await InterviewLoader.load(to)
      resolve()
      setTimeout(() => {
        global.loading.active = false
      })
    } catch (err) {
      if (this.isNotAuthError(err)) {
        this.logError(err)
      }
    }
  })
}

let interviewState
let interviewData // used to store the preloaded data for the interview
export default {
  name: 'Interview',
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
      disableInput: false,
      showSafeToExitMessage: false,
      type: 'interview',
      conditionAssignmentErrors: null,
      interviewData: {},
      interviewActions: {},
      interviewConditionTags: {},
      interview: {},
      form: null as Form,
      location: {
        section: 0,
        page: 0,
        sectionRepetition: 0,
        sectionFollowUpDatumRepetition: null,
        sectionFollowUpDatumId: null,
      },
      dialog: {
        beginning: false,
        end: false,
        conditionTag: false,
      },
      navigation: {
        next: false,
        prev: false,
      },
      alreadyExited: false,
      questions: [],
      loadingStep: 0,
      section: null,
      respondent: null as Respondent,
    }
  },
  created () {
    computedTitle('Interview', () => {
      if (this.type === 'preview') {
        return { key: 'preview_form', args: [this.formName] }
      }
      if (this.respondentName) {
        return { key: 'survey_with', args: [this.respondentName] }
      }
      return { key: 'survey' }
    })
    actionBus.on('action', this.actionHandler)
    menuBus.$on('showConditionTags', this.showConditionTags)
    onBeforeUnload(this.prematureExit.bind(this))
    this.hydrate(interviewData)
  },
  beforeDestroy: function () {
    menuBus.$off('showConditionTags', this.showConditionTags)
    actionBus.off('action', this.actionHandler)
  },
  async beforeRouteLeave (to, from, next) {
    await this.leaving()
    next()
  },
  async beforeRouteUpdate (to, from, next) {
    if (to.params.studyId !== from.params.studyId || to.params.interviewId !== from.params.interviewId) {
      await this.leaving()
      await load(to)
      this.hydrate(interviewData)
    }
    next()
  },
  async beforeRouteEnter (to, from, next) {
    await load(to)
    next()
  },
  methods: {
    async leaving () {
      if (!this.alreadyExited) {
        await this.saveData()
        await this.completeInterview()
        interviewState.destroy()
      }
      this.alreadyExited = false // For route updates
    },
    hydrate (data) {
      this.type = data.interviewType
      this.initializeInterview(data)
    },
    async initializeInterview (d) {
      const { actions, form, baseRespondentConditionTags, conditionTags, data, interview, respondentFills, respondent } = d
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
        interviewState.setSaveData(true)
        interviewState.setSaveActions(true)
      }
      if (this.$route.query.location && (this.type !== 'preview')) {
        interviewState.setInitialLocation(JSON.parse(this.$route.query.location))
      }
      await interviewState.initialize()
      // Share the relevant parts of the interview with the view
      this.interviewData = interviewState.data.data
      this.interviewConditionTags = interviewState.data.conditionTags
      this.interviewActions = interviewState.actions.store
      this.interview = interview
      this.respondent = respondent
      this.conditionAssignmentErrors = interviewState.conditionAssignmentErrors
      this.form = form
      interviewState.on('atEnd', this.showEndDialog, this)
      interviewState.on('atBeginning', this.showBeginningDialog, this)
      interviewState.on('error', this.onError, this)
      this.isLoading = false
      this.updateInterview()
    },
    async actionHandler (action) {
      if (!interviewState) {
        throw Error('Trying to push actions before interview has been initialized')
      }
      if (action.actionType === AT.next || action.actionType === AT.previous) {
        this.disableInput = true
        if (action.actionType === AT.next) {
          this.navigation.next = true
        } else {
          this.navigation.prev = true
        }
        this.$forceUpdate()
      }
      await interviewState.pushAction(action)
      this.updateInterview()
      this.disableInput = false
      this.navigation.next = false
      this.navigation.prev = false
    },
    updateInterview () {
      this.isAtEnd = interviewState.navigator.isAtEnd
      this.isAtBeginning = interviewState.navigator.isAtStart
      const sameLocation = locationsAreEqual(this.location, interviewState.location)
      if (this.location) {
        merge(this.location, interviewState.location)
      } else {
        this.location = interviewState.location
      }
      // this.location = interviewState.location
      this.section = interviewState.navigator.currentSection()

      if (!sameLocation) {
      // The reference to this.location needs to be here so that we have a dependency on this.location
        const questions = interviewState.getPageQuestions(
          this.location.section,
          this.location.sectionRepetition,
          this.location.sectionFollowUpDatumId,
          this.location.page,
        )
        this.questions = questions.map(q => {
          q.type = {
            name: q.questionType.name,
          }
          const validation = allParametersAreValidWithError(q, q.questionParameters, q.datum)
          q.allParametersSatisfied = validation === true // Makes non-boolean types falsey
          q.validationError = typeof validation === 'string' ? validation : null
          q.isAnswered = false
          return q
        })
        this.questions = questions || []
        const route = cloneDeep({
          name: this.$route.name,
          params: this.$route.params,
          query: this.$route.query,
        })
        if (!route.query) route.query = {}
        route.query.location = JSON.stringify({
          page: this.location.page,
          section: this.location.section,
          sectionRepetition: this.location.sectionRepetition,
          sectionFollowUpDatumId: this.location.sectionFollowUpDatumId,
        })
        this.$router.replace(route)
      } else {
        for (const q of this.questions) {
          const validation = allParametersAreValidWithError(q, q.questionParameters, q.datum)
          q.allParametersSatisfied = validation === true // Makes non-boolean types falsey
          q.validationError = typeof validation === 'string' ? validation : null
          q.isAnswered = false
        }
      }
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
    onError (err) {
      this.alert('error', err.msg, { timeout: 0 })
    },
    async lockAndExit () {
      try {
        await this.saveData()
        await this.completeInterview()
        await this.completeSurvey()
        this.dialog.end = false
        if (this.type !== 'preview') {
          this.exit()
        }
      } catch (err) {
        this.log(err)
        this.error = err
      }
    },
    exit () {
      this.alreadyExited = true
      const nextRoute = routeQueue.next()
      if (nextRoute) {
        routeQueue.replace(nextRoute)
      } else {
        routeQueue.replace({ name: 'SurveyComplete', params: { surveyId: this.interview.surveyId } })
      }
    },
    async saveData () {
      this.isSaving = true
      await interviewState.finalSave()
      this.isSaving = false
    },
    async completeSurvey () {
      if (this.type === 'preview') return
      return SurveyService.complete(this.interview.surveyId)
    },
    async completeInterview () {
      if (this.type === 'preview') return
      return InterviewService.complete(this.interview.id)
    },
    async saveAndExit () {
      await this.saveData()
      await this.completeInterview()
      this.dialog.end = false
      this.exit()
    },
    prematureExit (e) {
      this.saveData().then(() => {
        this.showSafeToExitMessage = true
      })
      this.completeInterview()
      const dialogText = this.$t('survey_message_exit')
      e.returnValue = dialogText
      return dialogText
    },
  },
  computed: {
    formIsEmpty (): boolean {
      return !this.isLoading && !(this.form && this.form.sections && this.form.sections.length)
    },
    isRepeated (): boolean {
      return this.section && (this.section.isRepeatable || this.section.followUpQuestionId !== null)
    },
    currentRepetition (): number {
      return this.section.isRepeatable ? this.location.sectionRepetition : this.location.sectionFollowUpRepetition
    },
    formName (): string {
      return this.form && this.form.nameTranslation
        ? TranslationService.getAny(this.form.nameTranslation, this.global.locale)
        : ''
    },
    respondentName (): string {
      const res = this.respondent ? this.respondent.name : ''
      console.log('computed respondent name', res)
      return res
    },
  },
  components: {
    Page,
    ConditionTagList,
    AsyncTranslationText,
    ConditionAssignmentErrors,
  },
}
</script>

<style lang="sass">
.trellis-interview
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
