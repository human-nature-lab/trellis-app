<template>
  <v-app :dark="useDarkTheme">
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text">
        Trellis
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="useDarkTheme=!useDarkTheme">
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
  import LocaleChanger from '@/components/LocaleChanger'
  import storage from '@/services/storage/StorageService'
  if (storage.get('localeId') === null) {
    storage.set('localeId', '48984fbe-84d4-11e5-ba05-0800279114ca')
  }
  export default {
    name: 'web-app',
    data: function () {
      return {
        useDarkTheme: false,
        study: storage.get('current-study') || {}
      }
    },
    components: {
      LocaleChanger
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
    margin-top: 35px;
    margin-bottom: 50px;
  }
</style>
