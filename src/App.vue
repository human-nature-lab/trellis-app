<template>
  <v-app light>
    <v-toolbar>
      <v-toolbar-title class="deep-orange--text">Trellis</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container v-if="!isLoading" fluid>
        <!--<router-view></router-view>-->
        <Page :questions="questions"></Page>
      </v-container>
      <v-container v-if="isLoading">
        Loading...
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import Page from './components/Page'
  import dataService from './services/DataService'
  import interviewState from './InterviewNavigator'
  import translationService from './services/TranslationService'
  export default {
    data () {
      return {
        cordova: Vue.cordova,
        clipped: false,
        title: 'Trellis',
        interviewState: interviewState,
        isLoading: true
      }
    },
    created () {
      var self = this
      this.cordova.on('deviceready', () => {
        self.onDeviceReady()
      })
      dataService.setStudyId('ad9a9086-8f15-4830-941d-416b59639c41')
      dataService.getLocales()
        .then(locales => {
          console.log('locales', locales)
          translationService.setLocale(locales[0])
          return dataService.getStructure('be587a4a-38c6-46cb-a787-1fcb4813b274')
        })
        .then(resData => {
          console.log(resData)
          interviewState.loadStructure(resData.structure)
          this.isLoading = false
        })
        .catch(err => {
          throw err
        })
    },
    computed: {
      questions: function () {
        let questions = this.interviewState.getCurrentPageQuestions()
        console.log('Computed questions', questions)
        return questions || []
      }
    },
    methods: {
      onDeviceReady: function () {
        // Handle the device ready event.
        this.cordova.on('pause', this.onPause, false)
        this.cordova.on('resume', this.onResume, false)
        if (this.cordova.device.platform === 'Android') {
          document.addEventListener('backbutton', this.onBackKeyDown, false)
        }
      },
      onPause () {
        // Handle the pause lifecycle event.
        console.log('pause')
      },
      onResume () {
        // Handle the resume lifecycle event.
        // SetTimeout required for iOS.
        setTimeout(function () {
          console.log('resume')
        }, 0)
      },
      onBackKeyDown () {
        // Handle the back-button event on Android. By default it will exit the app.
        navigator.app.exitApp()
      }
    },
    components: {
      Page
    }
  }
</script>

<style>
	body{
    /*height: 100%;*/
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }

</style>
