<template>
  <div class="sync">
    <div class="sync-content">
      <sync-status v-if="!downloading && !uploading"></sync-status>
      <download
        v-if="downloading"
        v-on:download-cancelled="downloadCancelled">
      </download>
    </div>
    <v-flex class="sync-footer v-flex xs12 sm12 md6 offset-md3">
      <v-layout row
                justify-space-between>
        <v-btn justify-left
               :disabled="!enableUpload()">
          <v-icon>cloud_upload</v-icon>
        </v-btn>
        <v-btn justify-right
               @click="onDownload"
               :loading="downloading"
               :disabled="!enableDownload()">
          <v-icon>cloud_download</v-icon>
        </v-btn>
      </v-layout>
    </v-flex>
  </div>
</template>

<script>
  import SyncStatus from './SyncStatus'
  import SyncService from './services/SyncService'
  import DatabaseService from '@/services/database/DatabaseService'
  import Download from './download/Download'
  export default {
    name: 'sync',
    data () {
      return {
        uploading: false,
        downloading: false,
        serverLatestSnapshot: null,
        localLatestSnapshot: null,
        updatedRecordsCount: null
      }
    },
    created () {
      Promise.all([
        DatabaseService.getLatestDownload(),
        DatabaseService.getUpdatedRecordsCount()
      ]).then(results => {
        this.localLatestSnapshot = results[0]
        this.updatedRecordsCount = results[1]
        console.log('localLatestSnapshot', this.localLatestSnapshot)
        console.log('updatedRecordsCount', this.updatedRecordsCount)
      }, errors => {
        console.error(errors)
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
      },
      onDownload: function () {
        this.downloading = true
      },
      downloadCancelled: function () {
        this.downloading = false
      },
      enableDownload: function () {
        if (this.localLatestSnapshot === null || this.updatedRecordsCount === null || this.downloading) {
          return false
        }
        return this.updatedRecordsCount === 0
      },
      enableUpload: function () {
        if (this.localLatestSnapshot === null || this.updatedRecordsCount === null) {
          return false
        }
        return this.updatedRecordsCount > 0
      }
    },
    computed: {
    },
    components: {
      Download,
      SyncStatus
    }
  }
</script>

<style lang="sass" scoped>
  .sync-footer
    flex-shrink: 0
    padding: 20px
</style>
