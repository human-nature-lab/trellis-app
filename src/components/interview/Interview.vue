<template>
  <v-flex>
    <v-progress-linear :active="isLoading" indeterminate height="2"></v-progress-linear>
    <Page :questions="questions"
          :location="location"
          :interview="interviewState"
          v-if="!isLoading"
    />
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
  import Interview from './models/Interview'
  import InterviewService from './services/interview/InterviewService'
  import TranslationService from '@/services/TranslationService'
  import StringInterpolationService from '@/services/StringInterpolationService'
  import FormService from '@/services/form/FormService'
  import actionBus from './services/ActionBus'
  import InterviewDataService from './services/interview-data/InterviewDataService'
  import InterviewActionsService from './services/interview-actions/InterviewActionsService'
  export default {
    data () {
      return {
        studyId: this.$route.params.studyId,
        interviewId: this.$route.params.interviewId,
        formId: null,
        surveyId: null,
        clipped: false,
        isLoading: true,
        interviewState: null,
        beginningDialog: false,
        endDialog: false
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
          return Promise.all([
            InterviewActionsService.getActions(this.interviewId)
              .catch(err => {
                console.error('interview actions route does not work', err)
                return []
              }),
            InterviewService.getData(this.interviewId)
              .catch(err => {
                console.error('interview data service does not work', err)
                return []
              }),
            FormService.getForm(interview.survey.form_id)
          ]).then(results => {
            let [actions, data, formBlueprint] = results
            this.interviewState = new Interview(interview, formBlueprint, actions, data)
            this.interviewDataService = new InterviewDataService(() => {
              return this.interviewState.data
            }, () => {
              return this.interviewState.conditionTags
            })
            this.interviewState.bootstrap()
            this.interviewState.on('atEnd', this.showEndDialog, this)
            this.interviewState.on('atBeginning', this.showBeginningDialog, this)
            this.isLoading = false
          })
        })
      actionBus.$on('action', this.actionHandler)
    },
    methods: {
      actionHandler: function (action) {
        if (!this.interviewState) {
          throw Error('Trying to push actions before interview has been initialized')
        }
        this.interviewState.pushAction(action)
        this.interviewDataService.send()
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
        let followUpQuestionDatumMap = this.interviewState.getCurrentFollowUpQuestionDatum().reduce((agg, qDatum) => {
          agg[qDatum.var_name] = qDatum.data.join(', ') + '_INTERPOLATED'
          return agg
        }, {})
        console.log('follow up question datum', followUpQuestionDatumMap)
        let questions = this.interviewState.getPageQuestions().map(q => {
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
      location: function () {
        return this.interviewState.location
      }
    },
    components: {
      Page
    }
  }
</script>

<style scoped>

</style>
