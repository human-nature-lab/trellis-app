<template>
  <v-container fill-height class="home">
    <v-layout row wrap>
      <v-flex xs12>
        <Login v-if="hasSynced"></Login>
      </v-flex>
      <v-flex xs12>
        <Sync v-if="isCordova"></Sync>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import SyncService from '../services/sync/SyncService'
  import Sync from './sync/Sync.vue'
  import Login from './login/Login.vue'
  export default {
    name: 'home',
    data () {
      return {
        hasSynced: false
      }
    },
    created () {
      SyncService.hasSynced()
        .then((_hasSynced) => { this.hasSynced = _hasSynced })
    },
    computed: {
    },
    components: {
      Sync,
      Login
    }
  }
</script>
