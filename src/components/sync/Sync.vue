<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row class="sync-content">
            <v-flex class="xs12">
              <sync-status v-if="!downloading && !uploading && !downloadingPhotos"></sync-status>
              <upload
                v-if="uploading"
                v-on:upload-done="uploadDone"
                v-on:upload-cancelled="uploadCancelled">
              </upload>
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
              <v-btn :disabled="!enableUpload"
                     @click="onUpload">
                <v-icon>cloud_upload</v-icon>
              </v-btn>
            </v-flex>
            <v-flex class="xs6 text-xs-right">
              <v-btn @click="onDownload"
                     :loading="downloading"
                     :disabled="!enableDownload">
                <v-icon>cloud_download</v-icon>
              </v-btn>
              <v-btn @click="onDownloadPhotos"
                     :loading="downloadingPhotos"
                     :disabled="!enablePhotoDownload">
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
  import SyncService from '../../services/sync/SyncService'
  import DatabaseService from '../../services/database/DatabaseService'
  import Download from './download/Download'
  import Upload from './upload/Upload'

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
      this.initComponent()
    },
    props: {},
    methods: {
      initComponent: async function() {
        this.loading = true
        this.localLatestSnapshot = await DatabaseService.getLatestDownload()
        this.updatedRecordsCount = await DatabaseService.getUpdatedRecordsCount()
        this.loading = false
      },
      onDownload: function () {
        this.downloadStep = 1
        this.downloading = true
      },
      onUpload: function () {
        this.uploading = true
      },
      onDownloadPhotos: function () {
        this.downloadStep = 4
        this.downloadingPhotos = true;
      },
      downloadCancelled: function () {
        this.downloading = false
        this.downloadingPhotos = false
      },
      downloadDone: function () {
        this.downloading = false
        this.initComponent()
      },
      uploadCancelled: function () {
        this.uploading = false
      },
      uploadDone: function () {
        this.uploading = false
        this.initComponent()
      }
    },
    computed: {
      enableDownload: function () {
        return ( (this.updatedRecordsCount === 0) && this.enableAll )
      },
      enableUpload: function () {
        return ( (this.updatedRecordsCount > 0) && this.enableAll )
      },
      enablePhotoDownload: function () {
        return ( (this.localLatestSnapshot !== null) && this.enableAll )
      },
      enableAll: function () {
        return ( !this.loading && !this.downloading && !this.downloadingPhotos && !this.uploading )
      }
    },
    components: {
      Download,
      Upload,
      SyncStatus
    }
  }
</script>

<style lang="sass" scoped>
</style>
