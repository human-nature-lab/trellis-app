<template>
  <v-app light dense class="web" :dark="global.darkTheme">
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text">
        Trellis
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="subheading" flat :to="{name: 'locale', query: {to: this.$route.path}}">
        {{global.locale ? global.locale.language_tag : ''}}
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
          <v-list-tile v-if="global.study" v-for="(id, index) in interviewIds" :key="id">
            <router-link :to="{name: 'Interview', params: {studyId: global.study.id, interviewId: id}}">Interview {{id}}</router-link>
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
  import StudyService from './services/study/StudyService'
  export default {
    name: 'web-app',
    data: function () {
      return {
        error: null,
        interviewIds: ['0011bbc8-59e7-4c68-ab48-97d64760961c', 'f8a82e2a-b6c9-42e5-9803-aacec589f796', '9457d7c8-0b37-4098-8aa4-4b928b2503e5']
      }
    },
    created: function () {
      StudyService.getStudy('ad9a9086-8f15-4830-941d-416b59639c41').then(study => {
        StudyService.setCurrentStudy(study)
      })
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
