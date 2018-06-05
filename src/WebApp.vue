<template>
  <v-app light dense class="web" :dark="global.darkTheme">
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text logo">
        <router-link :to="{name: 'home'}">
          <img src="../static/img/trellis-logo.png" alt="trellis">
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="subheading" flat :to="{name: 'locale', query: {to: $route.fullPath}}">
        {{global.locale ? global.locale.language_tag : ''}}
      </v-btn>
      <v-btn icon @click="global.darkTheme=!global.darkTheme">
        <v-icon>wb_sunny</v-icon>
      </v-btn>
      <v-btn icon @click="refresh()">
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-menu offset-y :nudge-top="-15" z-index="1000">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile>
            <router-link :to="{name: 'RespondentsSearch'}">Respondents</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'camera'}">Camera</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Home', query: {to: $route.fullPath}}">Study</router-link>
          </v-list-tile>
          <v-list-tile v-if="global.study" v-for="(id, index) in interviewIds" :key="id">
            <router-link :to="{name: 'Interview', params: {studyId: global.study.id, interviewId: id}}">Interview {{id}}</router-link>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-container fluid class="app-container">
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
      StudyService.getStudy('ad9a9086-8f15-4830-941d-416b59639c41').then(study => {
        StudyService.setCurrentStudy(study)
      })
      LocaleService.setExistingLocale()
    },
    components: {
      LoadingPage
    }
  }
</script>

<style lang="sass">
  html
    overflow-y: auto
  body
    /*padding-top: constant(safe-area-inset-top)*/
    /*padding-top: env(safe-area-inset-top)*/
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
  .fade-in
    animation: fade-in .3s ease-in-out 0s 1
  @keyframes fade-in
    0%
      opacity: 0
    100%
      opacity: 1
</style>
