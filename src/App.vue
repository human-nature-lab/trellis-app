<template>
  <v-app light :class="{web: isWeb, cordova: isCordova}">
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text">
        Trellis <span class="grey--text" v-if="locale">- {{locale.language_tag}}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y :nudge-top="-15">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile>
            <v-btn icon @click="settingsDialog=true">
              <v-icon>settings</v-icon>
            </v-btn>
          </v-list-tile>
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
            <router-link :to="{name:'QuestionExamples'}">Question Examples</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '0'}}">Form 1</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '1'}}">Form 2</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: studyId, interviewId: '2'}}">Form 3</router-link>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-container fluid class="app-container">
        <v-card v-if="!locale" tile>
          <h3>Please select a locale before using the app</h3>
        </v-card>
        <router-view v-if="locale"></router-view>
      </v-container>
    </v-content>
    <v-dialog v-if="settingsDialog"
              v-model="settingsDialog"
              fullscreen
              transition="dialog-bottom-transition"
              :overlay="false"
              scrollable>
      <v-card tile>
        <v-card-title>
          <v-toolbar card dark color="secondary">
            <v-btn icon @click.native="settingsDialog = false" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Options</v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-select
            :items="locales"
            label="Locale"
            item-text="language_name"
            v-model="locale"
            @change="setLocale"
            :loading="isLoadingLocales"
            :error-messages="['Must select a locale']"
            single-line
            :hint="locale ? `${locale.language_native}, ${locale.language_tag}` : ''">
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialog3=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import DeviceService from './services/device/DeviceService'
  import Interview from './components/interview/Interview'
  import config from './config'
  import {APP_ENV} from './constants'
  import storage from './services/storage/StorageService'
  import DataService from './services/data/DataService'
  // TODO: This should be set by the app instead of being hardcoded
  storage.set('studyId', 'ad9a9086-8f15-4830-941d-416b59639c41')

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
        title: 'Trellis',
        _isDeviceReady: false,
        settingsDialog: false,
        locales: [],
        storage: storage,
        locale: storage.get('locale', 'object') || null,
        isLoadingLocales: true
      }
    },
    created () {
      this.cordova.on('deviceready', () => {
        this.onDeviceReady()
      })
      this.loadStudyLocales()
    },
    computed: {
      isDeviceReady: function () {
        return this._isDeviceReady
      },
      studyId: function () {
        return this.storage.get('studyId', 'string')
      },
      isWeb: function () {
        return config.appEnv === APP_ENV.WEB
      },
      isCordova: function () {
        return config.appEnv === APP_ENV.CORDOVA
      }
    },
    methods: {
      setLocale: function (newLocale) {
        // Called to keep the locale in sync with local storage
        console.log('setting locale')
        this.storage.set('locale', newLocale)
        this.storage.set('localeId', newLocale.id)
        this.locale = newLocale
        this.$forceUpdate()
      },
      onDeviceReady: function () {
        console.log('device ready')
        this._isDeviceReady = true
        // Handle the device ready event.
        this.cordova.on('pause', this.onPause, false)
        this.cordova.on('resume', this.onResume, false)
        // TODO: remove App component dependency on DeviceService completely. No need for it to be loaded in the web version
        if (DeviceService.getPlatform() === 'Android') {
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
      },
      loadStudyLocales () {
        this.isLoadingLocales = true
        DataService.getLocales()
          .then(locales => {
            this.locales = locales
            this.isLoadingLocales = false
          })
      }
    },
    components: {
      Interview
    }
  }
</script>

<style>
  html {
    overflow-y: auto;
  }
	body{
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }
  .app-container {
    margin-top: 25px;
    margin-bottom: 50px;
  }
</style>
