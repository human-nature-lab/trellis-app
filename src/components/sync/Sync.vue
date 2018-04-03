<template>
  <div class="sync">
    <div class="sync-content">
      <div>
        <v-progress-linear
          v-model="syncProgress"
          v-if="syncing"
        ></v-progress-linear>
      </div>
    </div>
    <div class="sync-footer">
      <v-layout row
                justify-space-between>
        <v-btn justify-left>
          <v-icon>cloud_upload</v-icon>
        </v-btn>
        <v-btn justify-right>
          <v-icon>cloud_download</v-icon>
        </v-btn>
      </v-layout>
    </div>
  </div>
</template>

<script>
  import SyncService from './services/SyncService'
  import DatabaseService from './services/DatabaseService'
  export default {
    name: 'sync',
    data () {
      return {
        syncing: true,
        syncProgress: 50,
        serverLatestSnapshot: null,
        localLatestSnapshot: null
      }
    },
    created () {
      // Get info about the latest snapshot on the server
      SyncService.getLatestSnapshot()
        .then(snapshot => {
          this.serverLatestSnapshot = snapshot
          console.log('serverLatestSnapshot', this.serverLatestSnapshot)
        })
      DatabaseService.getLatestSnapshot()
        .then(snapshot => {
          this.localLatestSnapshot = snapshot
          console.log('localLatestSnapshot', this.localLatestSnapshot)
        })
    },
    props: {
    },
    methods: {
      heartbeat: function () {
        return SyncService.getHeartbeat()
      },
      getHash: function () {
        return SyncService.getHash('lnvopnlfj asjvldfnbnero;no;aenionaeongoawernobvnaeronbo;pernho;ghaero;gno;aenmvonaongornjgoaejgo')
      }
    },
    computed: {
      latestSnapshot: function () {
        let snapshot = SyncService.getLatestSnapshot()
        console.log(snapshot)
        return snapshot
      }
    },
    components: {
    }
  }
</script>

<style lang="sass" scoped>
  .sync-footer
    flex-shrink: 0
    padding: 20px
</style>
