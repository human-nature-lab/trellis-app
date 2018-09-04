<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row class="sync-content">
            <v-flex class="xs12">
              <sync-status v-if="!downloading && !uploading"></sync-status>
              <download
                v-if="downloading"
                v-on:download-done="downloadDone"
                v-on:download-cancelled="downloadCancelled">
              </download>
            </v-flex>
          </v-layout>
          <v-layout row class="mt-2 sync-footer" justify-space-between>
            <v-flex class="xs3 text-xs-left">
              <v-btn :disabled="!enableUpload()">
                <v-icon>cloud_upload</v-icon>
              </v-btn>
            </v-flex>
            <v-flex class="xs3 text-xs-right">
              <v-btn @click="onDownload"
                     :loading="downloading"
                     :disabled="!enableDownload()">
                <v-icon>cloud_download</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import SyncStatus from './SyncStatus'
  import SyncService from '../../services/SyncService'
  import DatabaseService from '../../services/database/DatabaseService'
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
      }, errors => {
        console.error(errors)
      })
    },
    props: {},
    methods: {
      heartbeat: function () {
        return SyncService.getHeartbeat()
      },
      onDownload: function () {
        this.downloading = true
      },
      downloadCancelled: function () {
        this.downloading = false
      },
      downloadDone: function () {
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
    computed: {},
    components: {
      Download,
      SyncStatus
    }
  }
</script>

<style lang="sass" scoped>
</style>
