<template>
  <v-flex class="page">
    <v-card>
      <debug name="Location">{{location}}</debug>
      <debug :name="'Assigned Conditions: ' + conditionTags.length">
        {{conditionTags}}
      </debug>
      <debug :name="'Actions: ' + actions.length">
        {{JSON.stringify(actions, null, 2)}}
      </debug>
      <v-flex class="page-content">
        <Question
          v-for="question in questions"
          :question="question"
          :interview="interview"
          :location="location"
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
  import actionBus from './services/ActionBus'
  export default {
    name: 'page',
    props: {
      questions: {
        type: Array,
        required: true
      },
      data: {
        type: Array,
        required: true
      },
      actions: {
        type: Array,
        required: true
      },
      conditionTags: {
        type: Object,
        required: true
      },
      interview: {
        type: Object,
        required: true
      },
      location: {
        type: Object,
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
