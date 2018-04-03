<template>
    <v-layout column justify-space-between>
      <Question v-for="question in questions"
                :key="question.id"
                :question="question"/>
    </v-layout>
</template>

<script>
  const questionTypes = ['intro', 'decimal', 'integer', 'multiple_select', 'multiple_choice']
  import mockQuestion from '../../services/test/MockQuestionService'
  import Question from './Question'
  export default {
    name: 'question-examples',
    data: function () {
      return {
        questions: []
      }
    },
    created: function () {
      questionTypes.forEach(type => {
        mockQuestion.get(type).then(question => {
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
