<template>
  <v-flex>
    <v-progress-linear :active="isLoading" indeterminate height="2"></v-progress-linear>
    <Page :questions="questions"
          :location="location"
          :interview="interviewState"
          v-if="!isLoading"
    />
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
  export default {
    data () {
      return {
        studyId: this.$route.params.studyId,
        interviewId: this.$route.params.interviewId,
        formId: null,
        surveyId: null,
        clipped: false,
        isLoading: true,
        interviewState: null
      }
    },
    created () {
      let interview = null
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
            InterviewService.getActions(this.interviewId)
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
