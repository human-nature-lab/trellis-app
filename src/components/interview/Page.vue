<template>
  <div class="page">
    <div class="debug">{{location}}</div>
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
               :disabled="!allRequiredQuestionsAnswered"
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
      location: {
        type: Object
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
      // TODO: // Calculate this and enable/disable next based on it
      allRequiredQuestionsAnswered: function () {
        return true
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
