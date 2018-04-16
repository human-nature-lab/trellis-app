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
          :key="question.id"/>
      </v-flex>
      <v-bottom-nav
        :value="true"
        fixed
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
      </v-bottom-nav>
    </v-card>
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
  /*.page-footer*/
    /*flex-shrink: 0*/
    /*padding: 20px*/
  .bottom-nav
    &.page-footer
      left: 0
      bottom: 0
    .btn
      max-width: none
      .btn__content
        flex-direction: row
        font-size: 16px
</style>
