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
  import storage from '@/services/storage/StorageService'
  if (storage.get('localeId') === null) {
    storage.set('localeId', '48984fbe-84d4-11e5-ba05-0800279114ca')
  }
  export default {
    name: 'web-app'
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
