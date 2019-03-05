<template>
  <v-app light dense class="web" :dark="global.darkTheme" :class="{ 'print-mode' : global.printMode, 'cpu-optimized': global.cpuOptimized }">
    <v-dialog
      max-width="300"
      v-model="global.loading.fullscreen && global.loading.active"
      persistent>
      <v-card>
        <v-card-title primary-title>
          <h3>{{ $t('loading') }}</h3>
        </v-card-title>
        <v-card-text>
          <v-layout row justify-center>
            <TrellisLoadingCircular />
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-navigation-drawer
      v-model="global.menuDrawer.open"
      app>
      <MainMenu />
    </v-navigation-drawer>
    <v-toolbar fixed app>
      <!-- MainMenu /-->
      <v-toolbar-side-icon
        @click.stop="global.menuDrawer.open = !global.menuDrawer.open"
        v-if="!global.menuDrawer.open"/>
      <v-toolbar-title class="logo">
        <router-link :to="{name: 'Home'}" class="deep-orange--text">
          <img src="../static/img/trellis-logo.png" alt="trellis">
        </router-link>
      </v-toolbar-title>
      <v-toolbar-title v-if="global.study" class="study">
        <v-tooltip right>
          <v-btn class="subheading" slot="activator"
                 flat
                 :to="{name: 'StudySelector', query: {to: $route.fullPath}}">
            {{global.study.name}}
          </v-btn>
          <span>{{$t('change_study')}}</span>
        </v-tooltip>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip left>
        <v-btn class="subheading"
               slot="activator"
               flat
               icon
               :to="{name: 'locale', query: {to: $route.fullPath}}">
          {{global.locale ? global.locale.languageTag : ''}}
        </v-btn>
        <span>{{$t('change_locale')}}</span>
      </v-tooltip>
      <v-toolbar-side-icon
        v-if="global.secondaryDrawer.isEnabled"
        @click.stop="global.secondaryDrawer.onClick">
        <v-icon>{{global.secondaryDrawer.icon || 'search'}}</v-icon>
      </v-toolbar-side-icon>
    </v-toolbar>
    <v-content>
      <v-dialog :value="alerts && alerts.length > 0" persistent>
        <v-card>
          <v-card-text>
            <trellis-alert :current-log="alerts[alerts.length - 1]"></trellis-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="dismissAlert()">Dismiss</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-container
        justify-start
        fluid
        fill-height
        class="ma-0 pa-0 app-container" :class="{'px-0': $vuetify.breakpoint.xsOnly }">
        <v-alert v-show="global.loading.error">
          {{global.loading.error}}
        </v-alert>
        <router-view class="route-container fade-in" />
      </v-container>
    </v-content>

    <LocationFinder />
    <CensusFormChecker />
    <SnackbarQueue />
    <DocsSidebar />

  </v-app>
</template>

<script>
  // import SingletonService from './services/singleton/SingletonService'
  import MainMenu from './components/main-menu/MainMenu'
  import CensusFormChecker from './components/CensusFormChecker'
  import VDivider from 'vuetify/src/components/VDivider/VDivider'
  import AlertService from './services/AlertService'
  import TrellisAlert from './components/TrellisAlert.vue'
  import TrellisLoadingCircular from './components/TrellisLoadingCircle'
  import LocationFinder from './components/LocationFinder'
  import router from './router'
  import singleton from './static/singleton'
  import {defaultLoggingService} from './services/logging/LoggingService'
  import GeoLocationService from './services/geolocation'
  import SnackbarQueue from './components/SnackbarQueue'
  import DocsSidebar from './components/documentation/DocsSidebar'
  import UserService from './services/user/UserService'

  export default {
    name: 'web-app',
    data () {
      return {
        global: singleton,
        error: null,
        interviewIds: ['0011bbc8-59e7-4c68-ab48-97d64760961c', 'f8a82e2a-b6c9-42e5-9803-aacec589f796', '9457d7c8-0b37-4098-8aa4-4b928b2503e5'],
        alerts: AlertService.alerts,
        cpuOptimized: true
      }
    },
    async created () {
      /* load the singleton object (selected study, locale, theme) from local storage */
      // await SingletonService.loadFromLocalStorage()
      if (this.withinCordova) {
        document.addEventListener('pause', this.onPause, false)
        document.addEventListener('resume', this.onResume, false)
        document.addEventListener('backbutton', this.onBackButton)
        this.startGPSWatch()
      }
      const user = await UserService.loadCurrentUser()
      this.$set(this.global, 'user', user)
    },
    beforeDestroy () {
      if (this.withinCordova) {
        document.removeEventListener('pause', this.onPause)
        document.removeEventListener('resume', this.onResume, false)
        document.removeEventListener('backbutton', this.onBackButton)
        defaultLoggingService.flushQueue()
        GeoLocationService.clearWatch()
      }
    },
    components: {
      VDivider,
      MainMenu,
      TrellisAlert,
      LocationFinder,
      CensusFormChecker,
      SnackbarQueue,
      DocsSidebar,
      TrellisLoadingCircular
    },
    computed: {
      withinCordova () {
        return window.cordova && typeof cordova === 'object'
      }
    },
    methods: {
      startGPSWatch () {
        if (this.global.watchGPS) {
          GeoLocationService.watchPosition()
        }
      },
      dismissAlert () {
        AlertService.removeAlert()
      },
      onPause () {
        // Handle the pause lifecycle event.
        console.log('pause')
        if (this.withinCordova) {
          GeoLocationService.clearWatch()
          defaultLoggingService.flushQueue()
        }
      },
      onResume () {
        // Handle the resume lifecycle event.
        // SetTimeout required for iOS.
        setTimeout(() => {
          this.startGPSWatch()
          console.log('resume')
        }, 0)
      },
      onBackButton () {
        console.log('back button pressed')
        if (router.currentRoute.name !== 'Interview' || confirm(this.$t('survey_message_exit'))) {
          router.go(-1)
        }
      },
    }
  }
</script>

<style lang="sass">
  .container
    &.fill-height
      align-items: start
  html
    overflow-y: auto
  body
    /*padding-top: constant(safe-area-inset-top)*/
    /*padding-top: env(safe-area-inset-top)*/
  .route-loading
    position: absolute
    margin: 0
    margin-top: 2px
  .navigation-drawer
    z-index: 1600
    padding: 0
  .dialog
    z-index: 1600
  .overlay
    z-index: 1500
  .app-container
    /*margin-top: 50px*/
    /*margin-bottom: 50px*/
  .list--dense
    padding-top: 0
  .logo
    height: 55%
    img
      max-width: 100%
      max-height: 100%
  .study
    margin-left: 0
  .fade-in
    animation: fade-in .3s ease-in-out 0s 1
  @keyframes fade-in
    0%
      opacity: 0
    100%
      opacity: 1

  .cpu-optimized
    *:not(.stepper_wrapper)
      transition-property: none !important
      transition-duration: 0s !important
      /*transform: none !important*/
      animation: none !important

</style>
