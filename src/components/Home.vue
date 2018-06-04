<template>
  <v-container fill-height class="home">
    <Login v-if="hasSynced"></Login>
    <Sync v-if="isCordova"></Sync>
  </v-container>
</template>

<script>
  import SyncService from './sync/services/SyncService'
  import Sync from './sync/Sync.vue'
  import Login from './login/Login.vue'
  import config from '../config'
  import constants from '../constants'
  export default {
    name: 'home',
    computed: {
      hasSynced: function () {
        return SyncService.hasSynced()
      },
      isCordova: function () {
        return (config.appEnv === constants.APP_ENV.CORDOVA)
      }
    },
    components: {
      Sync,
      Login
    }
  }
</script>

<style scoped>

</style>
