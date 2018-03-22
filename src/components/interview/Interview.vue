<template>
  <Page :questions="questions"
        :page="survey.location.page"
        :page-repetition="survey.location.pageRepetition"
        :section="survey.location.section"
        :section-repetition="survey.location.sectionRepetition"
  />
</template>

<script>
  import Vue from 'vue'
  import Page from './Page'
  import dataService from '../../services/DataService'
  import {sharedActionManager} from './services/ActionManager'
  import translationService from '../../services/TranslationService'
  import config from '../../config'

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
        clipped: false,
        survey: null,
        isLoading: true
      }
    },
    created () {
      dataService.setStudyId('ad9a9086-8f15-4830-941d-416b59639c41')
      dataService.getLocales()
        .then(locales => {
          console.log('locales', locales)
          translationService.setLocale(locales[0])
          return dataService.getStructure('be587a4a-38c6-46cb-a787-1fcb4813b274')
        })
        .then(resData => {
          this.actions = sharedActionManager('fake-id-1234567890-0987654321') // TODO: load existing actions here
          window.actions = this.actions
          this.actions.surveyState.survey.loadBlueprint(resData.structure)
          this.survey = this.actions.surveyState.survey
          console.log(resData)
          this.isLoading = false
        })
        .catch(err => {
          throw err
        })
    },
    computed: {
      questions: function () {
        let questions = this.survey.getCurrentQuestions()
        console.log('Computed questions', questions)
        return questions || []
      }
    },
    components: {
      Page
    }
  }
</script>

<style scoped>

</style>
