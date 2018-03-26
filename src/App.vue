<template>
  <v-app light>
    <v-toolbar>
      <v-toolbar-title class="deep-orange--text">
        Trellis
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y :nudge-top="-15">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile>
            <router-link :to="{name: 'Home'}">Home</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'RespondentForms', params: {studyId: studyId, respondentId: '/BKO-077f18e4-ff6c-4fb9-8f0b-6853f5904450'}}">Fidel Perez Forms</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name:'RespondentsSearch'}">Respondents Search</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '1'}}">Form 1</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '2'}}">Form 2</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '3'}}">Form 3</router-link>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import Interview from './components/interview/Interview'
  import config from './config'
  import storage from './services/StorageService'
  import dataService from './services/DataService'
  // TODO: This should be set by the app instead of being hardcoded
  storage.set('studyId', 'ad9a9086-8f15-4830-941d-416b59639c41')
  dataService.getLocales()
    .then(locales => {
      console.log('locales', locales)
      storage.set('locale', locales[0])
    })

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
      },
      anyValueMatches: function (iterable, value) {
        for (let key in iterable) {
          if (iterable[key] === value) {
            return true
          }
        }
        return false
      }
    }
  })
  export default {
    data () {
      return {
        cordova: Vue.cordova,
        clipped: false,
        title: 'Trellis'
      }
    },
    created () {
      var self = this
      this.cordova.on('deviceready', () => {
        self.onDeviceReady()
      })
    },
    computed: {
      studyId: function () {
        return storage.get('studyId', 'string')
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
      Interview
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
