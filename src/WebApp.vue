<template>
  <v-app light dense class="web" :dark="global.darkTheme">
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text">
        Trellis
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="subheading" flat :to="{name: 'locale', query: {to: this.$route.path}}">
        {{global.locale.language_tag}}
      </v-btn>
      <v-btn icon @click="global.darkTheme=!global.darkTheme">
        <v-icon>wb_sunny</v-icon>
      </v-btn>
      <v-menu offset-y :nudge-top="-15">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile>
            <router-link :to="{name: 'RespondentsSearch'}">Respondents</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: study.id, interviewId: '0'}}">Form 1</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: study.id, interviewId: '1'}}">Form 2</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: study.id, interviewId: '2'}}">Form 3</router-link>
          </v-list-tile>
          <v-list-tile>
            <router-link :to="{name: 'Interview', params: {studyId: study.id, interviewId: '3'}}">Form 4</router-link>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-container fluid class="app-container">
        <router-view />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import storage from './services/storage/StorageService'
  if (storage.get('localeId') === null) {
    storage.set('localeId', '48984fbe-84d4-11e5-ba05-0800279114ca')
  }
  export default {
    name: 'web-app',
    data: function () {
      return {
        study: storage.get('current-study') || {}
      }
    }
  }
</script>

<style scoped>
  html {
    overflow-y: auto;
  }
  body{
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }
  .app-container {
    margin-top: 50px;
    margin-bottom: 50px;
  }
</style>
