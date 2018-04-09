<template>
  <div class="page">
    <debug :name="'Location'">
      {{location}}
    </debug>
    <debug :name="'Assigned Conditions: ' + assignedConditions.length">
      {{assignedConditions}}
    </debug>
    <div class="page-content">
      <Question
        v-for="question in questions"
        :question="question"
        @action="actionHandler"
        :key="question.id"/>
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
  import Interview from './models/Interview'
  import actionBus from './services/ActionBus'
  export default {
    name: 'page',
    props: {
      questions: {
        type: Array,
        required: true
      },
      location: {
        type: Object
      },
      interview: {
        type: Interview,
        required: true
      }
    },
    created: function () {
      actionBus.$on('action', this.actionHandler)
    },
    methods: {
      onNext: function () {
        this.interview.pushAction({
          action_type: 'next'
        })
      },
      onPrevious: function () {
        this.interview.pushAction({
          action_type: 'previous'
        })
      },
      actionHandler: function (action) {
        this.interview.pushAction(action)
        this.$forceUpdate()
      }
    },
    computed: {
      // TODO: // Calculate this and enable/disable next based on it
      allRequiredQuestionsAnswered: function () {
        return true
      },
      assignedConditions: function () {
        return this.interview._getCurrentConditionTags()
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
