<template>
  <v-flex>
    <v-container v-if="isLoading">
      <v-layout>
        <LoadingPage
          :step="loadingStep"
          :message="loadingMessage"
          :max-steps="4" />
      </v-layout>
    </v-container>
    <Page :questions="questions"
          :location="location"
          :actions="interviewActions"
          :data="interviewData"
          :conditionTags="interviewConditionTags"
          :interview="interview"
          v-if="!isLoading" />
    <v-dialog
      v-model="beginningDialog">
      <v-card>
        <v-card-title class="headline">
          You've reached the beginning of the survey
        </v-card-title>
        <v-card-text>
          All changes have been saved. Would you like to exit the interview?
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="beginningDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="saveAndExit">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="endDialog">
      <v-card>
        <v-card-title class="headline">
          You've reached the end of the survey
        </v-card-title>
        <v-card-text>
          Would you like to exit and permanently lock the survey?
        </v-card-text>
        <v-card-actions>
          <v-btn
            flat
            color="error"
            @click="endDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            flat
            color="success"
            @click="lockAndExit">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import Page from './Page'
  import LoadingPage from './LoadingPage'

  import {sharedInterview, clearSharedInterview} from './models/Interview'
  import InterviewService from './services/interview/InterviewService'
  // import TranslationService from '../../services/TranslationService'
  // import StringInterpolationService from '../../services/StringInterpolationService'
  // import FormService from '../../services/form/FormService'
  import actionBus from './services/ActionBus'
  // import InterviewActionsService from './services/interview-actions/InterviewActionsService'

  import InterviewActionsService from './services/interview-actions/InterviewActionsService'
  import FormService from '../../services/form/FormService'
  import LocaleService from '../../services/locale/LocaleService'
  let interviewData = {}

  function loadInterview (interviewId) {
    let interview
    return InterviewService.getInterview(interviewId)
      .catch(err => {
        console.error('No interview exists with this id')
        throw err
      })
      .then(inter => {
        interview = inter
        return Promise.all([
          InterviewActionsService.getActions(interviewId).catch(() => {
            // throw new Error('Could not contact interview actions service: ' + err)
          }),
          InterviewService.getData(interviewId).catch(() => {
            // throw new Error('Could not contact interview data service: ' + err)
          }),
          FormService.getForm(interview.survey.form_id),
          InterviewService.getPreload(interviewId).catch(() => {
            // throw new Error('Could not contact preload data service: ' + err)
          })
        ]).then(results => {
          let [actions, data, formBlueprint, preload] = results
          for (let d of data) {
            for (let datum of d.data) {
              for (let key in datum) {
                if (datum[key] === null || datum[key] === undefined) {
                  delete datum[key]
                }
              }
            }
          }
          interviewData.interview = interview
          interviewData.actions = [] || actions
          interviewData.data = [] || data
          interviewData.form = formBlueprint
          interviewData.preload = preload
        }).catch(() => {
          // debugger
          // throw err
        })
      })
  }

  function loadPreview (formId) {
    let promises = [
      FormService.getForm(formId).then(form => {
        interviewData.form = form
      })
    ]
    return Promise.all(promises)
  }

  function interviewGuards (to, from, next) {
    LocaleService.setExistingLocale()
    let p
    if (to.name === 'Interview') {
      p = loadInterview(to.params.interviewId)
    } else {
      p = loadPreview(to.params.formId)
    }
    if (to.query.locale) {
      // TODO: set the locale here
    }
    return p.then(() => {
      next()
    })
  }

  let interviewState
  export default {
    data () {
      return {
        artificiallyExtendLoadTime: false,
        formId: null,
        surveyId: null,
        clipped: false,
        isLoading: true,
        interviewData: {},
        interviewActions: {},
        interviewConditionTags: {},
        interview: {},
        location: {
          section: 0,
          page: 0,
          sectionRepetition: 0,
          sectionFollowUpDatumRepetition: null,
          sectionFollowUpDatumId: null
        },
        beginningDialog: false,
        endDialog: false,
        loadingStep: 0
      }
    },
    created () {
      this.loadInterview()
      actionBus.$on('action', this.actionHandler)
      window.onbeforeunload = this.prematureExit
    },
    beforeRouteEnter (to, from, next) {
      console.log('before route enter', to)
      interviewGuards(to, from, next)
    },
    beforeRouteUpdate (to, from, next) {
      console.log('before route update', to)
      this.isLoading = true
      interviewData.intervew = null
      interviewData.actions = null
      interviewData.data = null
      interviewData.form = null
      interviewData.preload = null
      interviewGuards(to, from, next).then(() => {
        this.loadInterview()
      })
    },
    beforeRouteLeave  (to, from, next) {
      console.log('before route leave', to)
      if (to.name === 'Interview' || to.name === 'InterviewPreview') {
        this.isLoading = true
        interviewData.intervew = null
        interviewData.actions = null
        interviewData.data = null
        interviewData.form = null
        interviewData.preload = null
        interviewGuards(to, from, next).then(() => {
          this.loadInterview()
        })
      }
    },
    beforeDestroy: function () {
      window.onbeforeunload = null
    },
    methods: {
      loadInterview: function () {
        this.isLoading = false
        let conditionTags = interviewData.conditionTags
        let interview = interviewData.interview
        let actions = interviewData.actions
        let form = interviewData.form
        let data = interviewData.data
        let preload = []
        if (!interview) {
          interview = {
            id: 'fake id',
            survey: {
              respondent_id: 'ok'
            }
          }
        } else {
          InterviewService.setInterviewId(interview.id)
        }
        this.initializeInterview(interview, actions, data, conditionTags, form, preload)
      },
      initializeInterview: function (interview, actions, data, conditionTags, formBlueprint, preload) {
        clearSharedInterview()
        interviewState = sharedInterview(interview, formBlueprint, actions, data, conditionTags)
        // Share the relevant parts of the interview with the view
        this.interviewData = interviewState.data.data
        this.interviewConditionTags = interviewState.data.conditionTags
        this.interviewActions = interviewState.actions.store
        this.location = interviewState.navigator.location
        this.interview = interview
        interviewState.on('atEnd', this.showEndDialog, this)
        interviewState.on('atBeginning', this.showBeginningDialog, this)

        setTimeout(() => {
          this.isLoading = false
        }, this.artificiallyExtendLoadTime ? 2000 : 0)
      },
      actionHandler: function (action) {
        if (!interviewState) {
          throw Error('Trying to push actions before interview has been initialized')
        }
        interviewState.pushAction(action)
      },
      showBeginningDialog: function () {
        this.beginningDialog = true
      },
      showEndDialog: function () {
        this.endDialog = true
      },
      lockAndExit: function () {
        console.log('TODO: Lock and exit the survey')
      },
      saveAndExit: function () {
        console.log('TODO: Save and exit the survey')
      },
      prematureExit: function (e) {
        const dialogText = 'You have unsaved changes. Are you sure you want to leave?'
        e.returnValue = dialogText
        return dialogText
      }
    },
    computed: {
      questions: function () {
        // The reference to this.location needs to be here so that we have a dependency on this.location
        let questions = interviewState.getPageQuestions(this.location.sectionFollowUpDatumId).map(q => {
          q.type = {
            name: q.question_type.name
          }
          return q
        })
        return questions || []
      },
      loadingMessage: function () {
        switch (this.loadingStep) {
          case 1:
            return 'Loading existing actions, data and form definition'
          case 2:
            return 'Loading existing actions and data'
          case 3:
            return 'Loading existing actions'
          case 4:
            return 'Building survey'
          default:
            return 'Loading interview'
        }
      }
    },
    components: {
      Page,
      LoadingPage
    }
  }
</script>

<style scoped>

</style>
