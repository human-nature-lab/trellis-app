<template>
  <v-flex class="page">
    <v-card>
      <debug :name="'Location'">
        {{location}}
      </debug>
      <debug :name="'Assigned Conditions: ' + assignedConditions.length">
        {{assignedConditions}}
      </debug>
      <debug :name="'Actions: ' + interview.actions.length">
        {{interview.actions}}
      </debug>
      <v-flex class="page-content">
        <Question
          v-for="question in questions"
          :question="question"
          :interview="interview.interview"
          :key="question.id"/>
      </v-flex>
    </v-card>
    <v-flex
      class="page-footer">
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
    </v-flex>
  </v-flex>
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
    methods: {
      onNext: function () {
        actionBus.action({
          action_type: 'next'
        })
      },
      onPrevious: function () {
        actionBus.action({
          action_type: 'previous'
        })
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

<style lang="sass">
  $btn-height: 60px
  .page-footer
    box-shadow: 0 0px 10px rgba(0, 0, 0, .3)
    height: $btn-height
    position: fixed
    z-index: 100
    left: 0
    bottom: 0
    padding: 0
    margin: 0
    width: 100%
    .btn
      margin: 0
      width: 50%
      height: $btn-height
</style>
