<template>
  <v-app light>
    <v-toolbar fixed>
      <v-toolbar-title class="deep-orange--text">
        Trellis
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid class="app-container">
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    name: 'web-app',
    computed: {
      isLoggedIn: function () {
        return window.localStorage.getItem('interview-id')
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
    margin-top: 35px;
    margin-bottom: 50px;
  }
</style>
