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
  import {sharedInterview} from './models/Interview'
  import InterviewService from './services/interview/InterviewService'
  import TranslationService from '@/services/TranslationService'
  import StringInterpolationService from '@/services/StringInterpolationService'
  import FormService from '@/services/form/FormService'
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
            this.interviewState = sharedInterview(interview, formBlueprint, actions, data)
            this.isLoading = false
          })
        })
     // DataService.getForm('be587a4a-38c6-46cb-a787-1fcb4813b274')
     //    .then(resData => {
     //      this.actions = sharedActionManager(this.surveyId) // TODO: load and play existing actions here
     //      this.surveyState = new SurveyState()
     //      this.interview = new InterviewService()
     //      window.actions = this.actions
     //      this.surveyState.loadBlueprint(resData.blueprint)
     //      this.actions.on('action', this.surveyState.doAction, this.surveyState)
     //      this.actions.on('user-action', this.surveyState.doAction, this.surveyState)
     //      console.log(resData)
     //      this.isLoading = false
     //    })
     //    .catch(err => {
     //      throw err
     //    })
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
