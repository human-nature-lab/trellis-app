<template>
  <v-container fill-height class="home">
    <Login v-if="hasSynced"></Login>
    <Sync v-if="isCordova"></Sync>
  </v-container>
</template>

<script>
  import SyncService from '../services/sync/SyncService'
  import Sync from './sync/Sync.vue'
  import Login from './login/Login.vue'
  export default {
    name: 'home',
    computed: {
      hasSynced: function () {
        return SyncService.hasSynced()
      }
    },
    components: {
      Sync,
      Login
    }
  }
</script>
