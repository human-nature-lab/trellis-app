<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row class="sync-content">
            <v-flex class="xs12">
              <sync-status v-if="!downloading && !uploading && !downloadingPhotos"></sync-status>
              <download
                v-if="downloading || downloadingPhotos"
                :init-download-step="downloadStep"
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
            <v-flex class="xs6 text-xs-right">
              <v-btn @click="onDownload"
                     :loading="downloading"
                     :disabled="!enableDownload()">
                <v-icon>cloud_download</v-icon>
              </v-btn>
              <v-btn @click="onDownloadPhotos"
                     :loading="downloadingPhotos"
                     :disabled="!enablePhotoDownload()">
                <v-icon>portrait</v-icon>
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
        loading: true,
        downloadStep: 1,
        uploading: false,
        downloading: false,
        downloadingPhotos: false,
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
        this.loading = false
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
        this.downloadStep = 1
        this.downloading = true
      },
      onDownloadPhotos: function () {
        this.downloadStep = 4
        this.downloadingPhotos = true;
      },
      downloadCancelled: function () {
        console.log('foo')
        this.downloading = false
        this.downloadingPhotos = false
      },
      downloadDone: function () {
        this.downloading = false
      },
      enableDownload: function () {
        return ( (this.updatedRecordsCount === 0) && this.enableAll() )
      },
      enableUpload: function () {
        return ( (this.updatedRecordsCount > 0) && this.enableAll() )
      },
      enablePhotoDownload: function () {
        return ( (this.localLatestSnapshot !== null) && this.enableAll() )
      },
      enableAll: function () {
        return ( !this.loading && !this.downloading && !this.downloadingPhotos && !this.uploading )
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
