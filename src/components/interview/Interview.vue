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

  import Interview from './models/Interview'
  import InterviewService from './services/interview/InterviewService'
  import TranslationService from '../../services/TranslationService'
  import StringInterpolationService from '../../services/StringInterpolationService'
  import FormService from '../../services/form/FormService'
  import actionBus from './services/ActionBus'
  import InterviewDataService from './services/interview-data/InterviewDataService'
  import InterviewActionsService from './services/interview-actions/InterviewActionsService'

  let interviewState
  let interviewDataService
  export default {
    data () {
      return {
        studyId: this.$route.params.studyId,
        interviewId: this.$route.params.interviewId,
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
          sectionFollowUpDatumId: null
        },
        beginningDialog: false,
        endDialog: false,
        loadingStep: 0
      }
    },
    created () {
      let interview = null
      InterviewService.setInterviewId(this.interviewId)
      InterviewService.getInterview(this.interviewId)
        .catch(err => {
          console.error('No interview exists with this id')
          this.isLoading = false
          throw err
        })
        .then(inter => {
          interview = inter
          this.formId = interview.survey.form_id
          this.surveyId = interview.survey.id
          this.loadingStep++
          return Promise.all([
            InterviewActionsService.getActions(this.interviewId).catch(err => {
              console.error('interview actions route does not work', err)
              return []
            }).then(res => {
              return new Promise(resolve => {
                setTimeout(() => {
                  this.loadingStep++
                  resolve(res)
                }, 500)
              })
            }),
            InterviewService.getData(this.interviewId).catch(err => {
              console.error('interview data service does not work', err)
              return []
            }).then(res => {
              return new Promise(resolve => {
                setTimeout(() => {
                  this.loadingStep++
                  resolve(res || [])
                }, 1200)
              })
            }),
            FormService.getForm(interview.survey.form_id).then(res => {
              return new Promise(resolve => {
                setTimeout(() => {
                  this.loadingStep++
                  resolve(res)
                }, 1800)
              })
            })
          ]).then(results => {
            let [actions, data, formBlueprint] = results
            interviewState = new Interview(interview, formBlueprint, actions, data)
            interviewDataService = new InterviewDataService(() => {
              return interviewState.data
            }, () => {
              return interviewState.conditionTags
            })
            interviewState.bootstrap()
            // Bind the relevant parts to the view
            this.interviewData = interviewState.data
            this.interviewConditionTags = interviewState.conditionTags
            this.interviewActions = interviewState.actions.store
            this.location = interviewState.navigator.location
            this.interview = interview
            interviewState.on('atEnd', this.showEndDialog, this)
            interviewState.on('atBeginning', this.showBeginningDialog, this)
            setTimeout(() => {
              this.isLoading = false
            }, 2000)
          })
        })
      actionBus.$on('action', this.actionHandler)
    },
    methods: {
      actionHandler: function (action) {
        if (!interviewState) {
          throw Error('Trying to push actions before interview has been initialized')
        }
        interviewState.pushAction(action)
        interviewDataService.send()
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
      }
    },
    computed: {
      questions: function () {
        let followUpQuestionDatum = interviewState._getFollowUpQuestionDatum(this.location.section, this.location.sectionRepetition, this.location.sectionFollowUpDatumId)
        let followUpQuestionDatumMap = followUpQuestionDatum.reduce((agg, qDatum) => {
          agg[qDatum.var_name] = qDatum.data.join(', ') + '_INTERPOLATED'
          return agg
        }, {})
        console.log('follow up question datum', followUpQuestionDatumMap)
        let questions = interviewState.getPageQuestions().map(q => {
          q.type = {
            name: q.question_type.name
          }
          q.text = TranslationService.getTranslated(q.question_translation)
          q.text = StringInterpolationService.interpolate(q.text, followUpQuestionDatumMap)
          if (q.choices) {
            q.choices = q.choices.map(choice => {
              choice.text = TranslationService.getTranslated(choice.choice_translation)
              choice.text = StringInterpolationService.interpolate(choice.text, followUpQuestionDatumMap)
              return choice
            })
          }
          return q
        })
        console.log('Computed questions', questions)
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
