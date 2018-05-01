<template>
    <v-layout column justify-space-between>
      <Question v-for="question in questions"
                :key="question.id"
                :question="question"/>
    </v-layout>
</template>

<script>
  const questionTypes = ['intro', 'decimal', 'integer', 'multiple_select', 'multiple_choice', 'relationship', 'text', 'date', 'time']
  import MockQuestion from '@/services/mock/MockQuestionService'
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
