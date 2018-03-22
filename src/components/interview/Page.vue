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
  import {sharedActionManager} from './services/ActionManager'
  export default {
    name: 'page',
    data: function () {
      return {
        actions: null
      }
    },
    props: {
      questions: {
        type: Array,
        required: true
      },
      section: {
        type: Number
      },
      repetition: {
        type: Number
      },
      page: {
        type: Number
      }
    },
    mounted: function () {
      this.actions = sharedActionManager()
    },
    methods: {
      onNext: function () {
        console.log('next')
        this.actions.pushUserAction(null, 'next', null)
      },
      onPrevious: function () {
        console.log('previous')
        this.actions.pushUserAction(null, 'previous', null)
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
