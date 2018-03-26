<template>
  <v-flex>
    <v-progress-linear :active="isLoading" indeterminate height="2"></v-progress-linear>
    <Page :questions="questions"
          :location="location"
          v-if="!isLoading"
    />
  </v-flex>
</template>

<script>
  import Vue from 'vue'
  import Page from './Page'
  import dataService from '../../services/DataService'
  import {sharedActionManager} from './services/ActionManager'
  import config from '../../config'
  import SurveyState from './services/SurveyState'

  // Custom logging functions that respond to the debug setting in config.js
  Vue.mixin({
    methods: {
      log: function (...args) {
        if (config.debug) {
          console.log(...args)
        }
      },
      debug: function (...args) {
        if (config.debug) {
          console.debug(...args)
        }
      }
    }
  })
  export default {
    data () {
      return {
        studyId: this.$route.params.studyId,
        interviewId: this.$route.params.interviewId,
        surveyId: null,
        clipped: false,
        survey: null,
        isLoading: true
      }
    },
    created () {
      dataService.getForm('be587a4a-38c6-46cb-a787-1fcb4813b274')
        .then(resData => {
          this.actions = sharedActionManager(this.surveyId) // TODO: load and play existing actions here
          this.surveyState = new SurveyState()
          window.actions = this.actions
          this.surveyState.loadBlueprint(resData.structure)
          this.actions.on('action', this.surveyState.doAction, this.surveyState)
          this.actions.on('user-action', this.surveyState.doAction, this.surveyState)
          console.log(resData)
          this.isLoading = false
        })
        .catch(err => {
          throw err
        })
    },
    computed: {
      questions: function () {
        let questions = this.surveyState.getCurrentQuestions()
        console.log('Computed questions', questions)
        return questions || []
      },
      location: function () {
        return {
          page: this.surveyState.navigator.state.page || 0,
          sectionRepetition: this.surveyState.navigator.state.sectionRepetition || 0,
          section: this.surveyState.navigator.state.section || 0,
          sectionFollowUpRepetition: this.surveyState.navigator.state.sectionFollowUpRepetition || 0
        }
      }
    },
    components: {
      Page
    }
  }
</script>

<style scoped>

</style>
