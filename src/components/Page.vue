<template>
  <div class="page">
    <div class="page-content">
      <Question v-for="question in questions" :question="question" :key="question.id"/>
    </div>
    <div class="page-footer">
      <v-layout row
                justify-space-between>
        <v-btn @click="onPrevious"
               justify-left>
          <v-icon left>chevron_left</v-icon> Previous
        </v-btn>
        <v-btn @click="onNext"
               justify-right>
          Next <v-icon right>chevron_right</v-icon>
        </v-btn>
      </v-layout>
    </div>
  </div>
</template>

<script>
  import Question from './Question.vue'
  import interviewState from '../InterviewNavigator'
  export default {
    name: 'page',
    props: {
      questions: {
        type: Array,
        required: true
      }
    },
    methods: {
      onNext: (event) => {
        console.log('next')
        interviewState.next()
      },
      onPrevious: (event) => {
        console.log('previous')
        interviewState.previous()
      }
    },
    computed: {
      // Right now questions are responsible for assigning the isAnswered property themselves
      allQuestionsAnswered: function () {
        return Array.isArray(this.questions) && this.questions.filter(question => question.isAnswered).length === 0
      }
    },
    components: {
      Question
    }
  }
</script>

<style lang="sass" scoped>
  .page-footer
    flex-shrink: 0
    padding: 20px
</style>
