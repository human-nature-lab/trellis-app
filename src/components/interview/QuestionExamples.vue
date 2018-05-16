<template>
    <v-layout column justify-space-between>
      <Question v-for="question in questions"
                :key="question.id"
                :interview="interview"
                :location="location"
                :question="question"/>
    </v-layout>
</template>

<script>
  const questionTypes = ['intro', 'decimal', 'integer', 'multiple_select', 'multiple_choice', 'relationship', 'text', 'date', 'time']
  import MockService from '../../services/mock/MockService'
  import MockQuestion from '../../services/mock/MockQuestionService'
  import LocaleService from '../../services/locale/LocaleService'
  import Question from './Question'
  export default {
    name: 'question-examples',
    data: function () {
      return {
        questions: [],
        location: {
          section: 0,
          page: 0,
          sectionRepetition: 0,
          sectionFollowUpDatumId: null,
          sectionFollowUpDatumRepetition: 0
        },
        interview: {
          id: 'asdfalkskdkflf',
          survey: {
            respondent_id: 'asdf;lkjasdf'
          }
        }
      }
    },
    created: function () {
      this.global.locale = LocaleService.getCurrentLocale()
      MockService.locales.push(this.global.locale)
      questionTypes.forEach(type => {
        MockQuestion.get(type).then(question => {
          this.questions.push(question)
        })
      })
    },
    components: {
      Question
    }
  }
</script>

<style scoped>

</style>
