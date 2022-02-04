<template>
  <div class="main-wrapper">
    <Banner :serverMode="serverMode" />
    <v-app
      class="web"
      :dark="global.darkTheme"
      :class="{ 'print-mode' : global.printMode, 'cpu-optimized': global.cpuOptimized }">
      <v-navigation-drawer
        v-model="global.menuDrawer.open"
        app>
        <MainMenu />
      </v-navigation-drawer>
      <v-app-bar
        app
        absolute
        elevate-on-scroll
        scroll-target="#trellis-main">
        <v-app-bar-nav-icon
          :disabled="maintenanceMode"
          @click="global.menuDrawer.open = !global.menuDrawer.open" />
        <v-toolbar-title class="logo">
          <router-link :to="{name: 'Home'}" class="deep-orange--text">
            <img src="../static/img/trellis-logo.png" alt="trellis" />
          </router-link>
        </v-toolbar-title>
        <v-toolbar-title v-if="global.study" class="study">
          <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn 
                class="subheading"
                v-on="on"
                v-bind="attrs"
                :color="isTestStudy ? 'error' : null"
                text
                @click="toStudySelector">
                {{global.study.name}}
                <v-icon class="ml-2" v-if="isTestStudy" color="error">
                  mdi-dev-to
                </v-icon>
              </v-btn>
            </template>
            <span>{{$t('change_study')}}</span>
          </v-tooltip>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn 
              class="subheading"
              icon
              v-bind="attrs"
              v-on="on"
              @click="toLocaleSelector">
              {{global.locale ? global.locale.languageTag : ''}}
            </v-btn>
          </template>
          <span>{{$t('change_locale')}}</span>
        </v-tooltip>
        <v-tooltip
          v-if="global.secondaryDrawer.isEnabled"
          left>
          <template v-slot:activator="{on, attrs}">
            <v-icon
              v-on="on"
              v-bind="attrs"
              @click.stop="global.secondaryDrawer.onClick">
              {{global.secondaryDrawer.icon || 'mdi-magnify'}}
            </v-icon>
          </template>
          <span>{{$t('view_current_documentation')}}</span>
        </v-tooltip>
      </v-app-bar>
      <v-dialog
        max-width="300"
        :value="global.loading.fullscreen && global.loading.active"
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
      <v-main id="trellis-main" class="scroll-container">
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
        <v-container fluid fill-height class="align-start" v-if="!maintenanceMode">
          <router-view class="route-container fade-in" />
        </v-container>
        <v-container fluid fill-height class="align-start" v-else>
          <Maintenance v-model="maintenanceMode" />
        </v-container>
      </v-main>

      <LocationFinder />
      <CensusFormChecker />
      <SnackbarQueue />
      <DocsSidebar />
      <LoginModal />

    </v-app>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import MainMenu from './components/main-menu/MainMenu.vue'
  import CensusFormChecker from './components/CensusFormChecker.vue'
  import LoginModal from './components/login/LoginModal.vue'
  import SnackbarQueue from './components/SnackbarQueue.vue'
  import DocsSidebar from './components/documentation/DocsSidebar.vue'
  import TrellisAlert from './components/TrellisAlert.vue'
  import TrellisLoadingCircular from './components/TrellisLoadingCircle.vue'
  import LocationFinder from './components/LocationFinder.vue'
  import Banner from './components/Banner.vue'
  import Maintenance from './components/Maintenance.vue'
  import router, { routeQueue } from './router'
  import singleton from './static/singleton'
  // Do not remove!
  import SingletonService from './services/SingletonService'
  import config from 'config'
  import { defaultLoggingService } from './services/logging/LoggingService'
  import AlertService from './services/AlertService'
  import GeoLocationService from './services/geolocation'
  import UserService from './services/user/UserService'
  import maintenanceService, { MaintenanceData } from './services/maintenance'
  import IsLoggedInMixin from './mixins/IsLoggedInMixin'
  import PermissionMixin from './mixins/PermissionMixin'

  export default Vue.extend({
    name: 'WebApp',
    mixins: [IsLoggedInMixin, PermissionMixin],
    data () {
      return {
        global: singleton,
        maintenance: null as MaintenanceData,
        maintenanceMode: false,
        error: null,
        interviewIds: ['0011bbc8-59e7-4c68-ab48-97d64760961c', 'f8a82e2a-b6c9-42e5-9803-aacec589f796', '9457d7c8-0b37-4098-8aa4-4b928b2503e5'],
        alerts: AlertService.alerts,
        cpuOptimized: true,
        serverMode: config.serverMode
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
      } else {
        this.maintenance = await maintenanceService.getStatus()
        if (this.maintenance.active) {
          this.maintenanceMode = this.global.maintenanceKey !== this.maintenance.key
        }
      }
      try {
        const user = await UserService.loadCurrentUser()
        this.$set(this.global, 'user', user)
      } catch (err) {
        if (err && err.status !== 401) {
          console.log(err)
          this.log(err)
          this.alert('error', 'Unable to load user', {timeout: 0})
        }
      }
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
    watch: {
      'global.maintenanceKey' (val: string) {
        if (val && this.maintenance && this.maintenance.active) {
          this.maintenanceMode = val === this.maintenance.key
        }
      }
    },
    components: {
      MainMenu,
      TrellisAlert,
      LocationFinder,
      CensusFormChecker,
      SnackbarQueue,
      DocsSidebar,
      TrellisLoadingCircular,
      Banner,
      LoginModal,
      Maintenance,
    },
    computed: {
      withinCordova (): boolean {
        return window.cordova && typeof cordova === 'object'
      }
    },
    methods: {
      toStudySelector () {
        routeQueue.pushAndReturnToCurrent({ name: 'StudySelector' })
      },
      toLocaleSelector () {
        routeQueue.pushAndReturnToCurrent({ name: 'LocaleSelector' })
      },
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
  })
</script>

<style lang="sass">
  // .container
  //   &.fill-height
  //     align-items: start
  html, body
    // overflow: auto !important
    /*padding-top: constant(safe-area-inset-top)*/
    /*padding-top: env(safe-area-inset-top)*/
  // .route-loading
  //   position: absolute
  //   margin: 0
  //   margin-top: 2px
  // .navigation-drawer
  //   z-index: 1600
  //   padding: 0
  // .dialog
  //   z-index: 1600
  // .overlay
  //   z-index: 1500
  // .app-container
  //   /*margin-top: 50px*/
  //   /*margin-bottom: 50px*/
  // .app-container-demo
  //   padding-top: 56px
  // .main-menu
  //   margin-top: 0 !important
  // .main-menu-demo
  //   margin-top: 56px !important
  // .demo-banner
  //   z-index: 1600
  //   position: fixed
  //   width: 100%
  //   height: 55px
  //   margin-top: 0
  //   font-weight: bold
  //   font-size: 20px
  // @media only screen and (max-width: 900px)
  //   .demo-banner
  //     font-size: 15px
  // @media only screen and (max-width: 700px)
  //   .demo-banner
  //     font-size: 11px
  // .list--dense
  //   padding-top: 0
  .logo
    height: 55%
    img
      max-width: 100%
      max-height: 100%
  
  .main-wrapper
    display: flex
    flex-direction: column
    height: 100vh
    overflow: hidden

  .banner
    flex-grow: 0
  .v-application
    flex-grow: 1
    height: 100%
  .scroll-container
    overflow: auto
    flex: 1 1 auto !important
    margin-bottom: 64px
  // .study
  //   margin-left: 0
  .fade-in
    animation: fade-in .3s ease-in-out 0s 1
  @keyframes fade-in
    0%
      opacity: 0
    100%
      opacity: 1

  .cpu-optimized
    *:not(.stepper__wrapper)
      transition-property: none !important
      transition-duration: 0s !important
      /*transform: none !important*/
      animation: none !important
  .page-footer
    background-color: #808080 !important

</style>
