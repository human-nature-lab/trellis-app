<template>
  <v-app light dense class="web" :dark="global.darkTheme">
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
        <span class="study" v-if="global.study">
          ({{global.study.name}})
        </span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip left>
        <v-btn class="subheading"
               slot="activator"
               flat
               :to="{name: 'locale', query: {to: $route.fullPath}}">
          {{global.locale ? global.locale.language_tag : ''}}
        </v-btn>
        <span>{{$t('change_locale')}}</span>
      </v-tooltip>
      <v-tooltip left>
        <v-btn
          slot="activator"
          icon
          @click.stop="global.searchDrawer.open = !global.searchDrawer.open"
          v-if="global.searchDrawer.component !== null">
          <v-icon>search</v-icon>
        </v-btn>
        <span>{{$t('search')}}</span>
      </v-tooltip>
    </v-toolbar>
    <v-content>
      <v-container
        fluid
        fill-height
        class="ma-0 pa-0 app-container" :class="{'px-0': $vuetify.breakpoint.xsOnly }">
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
  import VDivider from 'vuetify/src/components/VDivider/VDivider'
  export default {
    name: 'web-app',
    data: function () {
      return {
        error: null,
        interviewIds: ['0011bbc8-59e7-4c68-ab48-97d64760961c', 'f8a82e2a-b6c9-42e5-9803-aacec589f796', '9457d7c8-0b37-4098-8aa4-4b928b2503e5']
      }
    },
    created: function () {
      StudyService.setExistingStudy()
      LocaleService.setExistingLocale()
    },
    components: {
      VDivider,
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
    /*margin-top: 50px*/
    /*margin-bottom: 50px*/
  .list--dense
    padding-top: 0
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
