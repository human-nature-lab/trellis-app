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
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import Interview from './components/interview/Interview'
  import config from './config'

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
