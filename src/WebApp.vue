<template>
  <v-app light dense class="web" :dark="global.darkTheme">
    <v-navigation-drawer
      v-model="global.menuDrawer.open"
      fixed
      app>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>
          </v-list-tile-content>
          <v-list-tile-action @click="global.menuDrawer.open = false" class="text-right">
            <v-icon>arrow_back</v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile :to="{name: 'RespondentsSearch'}">
          <v-list-tile-action>
            <v-icon>group</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Respondents</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{name: 'GeoSearch'}">
          <v-list-tile-action>
            <v-icon>place</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Locations</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list subheader>
        <v-subheader>Settings</v-subheader>
        <v-list-tile :to="{name: 'Home', query: {to: $route.fullPath}}">
          <v-list-tile-action>
            <v-icon>question_answer</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Change study</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :to="{name: 'locale', query: {to: $route.fullPath}}">
          <v-list-tile-action>
            <v-icon>language</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Change locale</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="global.darkTheme=!global.darkTheme">
          <v-list-tile-action>
            <v-icon>wb_sunny</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Toggle dark theme
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="refresh()">
          <v-list-tile-action>
            <v-icon>refresh</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              Refresh app
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="global.searchDrawer.open"
      fixed
      right
      app>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-action @click="global.searchDrawer.open = false" class="text-right">
            <v-icon>arrow_forward</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app>
      <!-- MainMenu /-->
      <v-toolbar-side-icon @click.stop="global.menuDrawer.open = !global.menuDrawer.open"></v-toolbar-side-icon>
      <v-toolbar-title class="logo">
        <router-link :to="{name: 'home'}" class="deep-orange--text">
          <img src="../static/img/trellis-logo.png" alt="trellis">
        </router-link>
        <span class="study" v-if="global.study">
          ({{global.study.name}})
        </span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="subheading" flat :to="{name: 'locale', query: {to: $route.fullPath}}">
        {{global.locale ? global.locale.language_tag : ''}}
      </v-btn>
      <v-btn icon @click.stop="global.searchDrawer.open = !global.searchDrawer.open">
        <v-icon>search</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid class="app-container" :class="{'px-0': $vuetify.breakpoint.xsOnly }">
        <LoadingPage
          v-if="global.loading.active"
          :indeterminate="global.loading.indeterminate"
          :step="global.loading.step"
          :message="global.loading.message"
          :max-steps="global.loading.steps" />
        <router-view
          class="route-container fade-in"
          v-show="!global.loading.active"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import StudyService from './services/study/StudyService'
  import LoadingPage from './components/LoadingPage'
  import LocaleService from './services/locale/LocaleService'
  import MainMenu from './components/main-menu/MainMenu'
  export default {
    name: 'web-app',
    data: function () {
      return {
        error: null,
        interviewIds: ['0011bbc8-59e7-4c68-ab48-97d64760961c', 'f8a82e2a-b6c9-42e5-9803-aacec589f796', '9457d7c8-0b37-4098-8aa4-4b928b2503e5']
      }
    },
    methods: {
      refresh: function () {
        window.location.reload(true)
      }
    },
    created: function () {
      StudyService.setExistingStudy()
      LocaleService.setExistingLocale()
    },
    components: {
      LoadingPage,
      MainMenu
    }
  }
</script>

<style lang="sass">
  html
    overflow-y: auto
  body
    /*padding-top: constant(safe-area-inset-top)*/
    /*padding-top: env(safe-area-inset-top)*/
  .navigation-drawer
    z-index: 1600
  .overlay
    z-index: 1500
  .app-container
    margin-top: 50px
    margin-bottom: 50px
  .logo
    height: 60%
    width: 100%
    font-size: 28px
    img
      max-width: 100%
      max-height: 100%
    .study
      color: #9d9d9d
      font-size: 20px
      display: inline-flex
      height: 145%
      padding-left: 10px
      vertical-align: middle
  .fade-in
    animation: fade-in .3s ease-in-out 0s 1
  @keyframes fade-in
    0%
      opacity: 0
    100%
      opacity: 1
</style>
