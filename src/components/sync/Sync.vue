<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row class="sync-content">
            <v-flex class="xs12">
              <sync-status
                v-if="!needsServerConfig && !downloading && !uploading && !downloadingPhotos && !uploadingPhotos"
                :local-latest-snapshot="localLatestSnapshot"
                :updated-records-count="updatedRecordsCount">
              </sync-status>
              <server-ip-config
                v-if="needsServerConfig"
                v-on:server-ip-config-done="onServerIPConfigDone">
              </server-ip-config>
              <upload
                v-if="uploading || uploadingPhotos"
                :init-upload-step="uploadStep"
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
          <v-layout
            v-if="!needsServerConfig"
            row
            class="mt-2 sync-footer"
            justify-space-between>
            <v-flex class="xs6 text-xs-left">
              <v-btn :disabled="!enableUpload"
                     :loading="uploading"
                     @click="onUpload">
                <v-icon>cloud_upload</v-icon>
              </v-btn>
              <v-btn @click="onUploadPhotos"
                     :loading="uploadingPhotos"
                     :disabled="!enablePhotoDownload">
                <v-icon>collections</v-icon>
                <v-icon>arrow_upward</v-icon>
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
                <v-icon>collections</v-icon>
                <v-icon>arrow_downward</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import AlertService from '../../services/AlertService'
  import SyncStatus from './SyncStatus'
  import SyncService from '../../services/SyncService'
  import DatabaseService from '../../services/database/DatabaseService'
  import Download from './download/Download'
  import Upload from './upload/Upload'
  import ServerIpConfig from './ServerIPConfig.vue'

  export default {
    name: 'sync',
    data () {
      return {
        loading: true,
        downloadStep: 1,
        uploadStep: 1,
        uploading: false,
        downloading: false,
        downloadingPhotos: false,
        uploadingPhotos: false,
        serverIPAddress: null,
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
        try {
          this.serverIPAddress = await DatabaseService.getServerIPAddress()
          this.localLatestSnapshot = await DatabaseService.getLatestDownload()
          this.updatedRecordsCount = await DatabaseService.getUpdatedRecordsCount()
          this.loading = false
        } catch (err) {
          AlertService.addAlert(err)
        }
      },
      onServerIPConfigDone: async function () {
        this.serverIPAddress = await DatabaseService.getServerIPAddress()
      },
      onDownload: function () {
        this.downloadStep = 1
        this.downloading = true
      },
      onUpload: function () {
        this.uploadStep = 1
        this.uploading = true
      },
      onUploadPhotos: function () {
        this.uploadStep = 3
        this.uploadingPhotos = true
      },
      onDownloadPhotos: function () {
        this.downloadStep = 4
        this.downloadingPhotos = true
      },
      downloadCancelled: function () {
        this.downloading = false
        this.downloadingPhotos = false
        this.uploadingPhotos = false
        // Re-init in case download was successful
        this.initComponent()
      },
      downloadDone: function () {
        this.downloading = false
        this.downloadingPhotos = false
        this.initComponent()
      },
      uploadCancelled: function () {
        this.uploading = false
        this.uploadingPhotos = false
        // Re-init in case upload was successful
        this.initComponent()
      },
      uploadDone: function () {
        this.uploading = false
        this.uploadingPhotos = false
        this.initComponent()
      }
    },
    computed: {
      needsServerConfig: function () {
        return this.serverIPAddress === undefined
      },
      enableDownload: function () {
        return ( (this.updatedRecordsCount === 0) && this.enableAll )
      },
      enableUpload: function () {
        return ( (this.updatedRecordsCount > 0) && this.enableAll )
      },
      enablePhotoDownload: function () {
        return ( this.localLatestSnapshot && this.enableAll )
      },
      enableAll: function () {
        return ( !this.loading && !this.downloading && !this.downloadingPhotos && !this.uploadingPhotos && !this.uploading )
      }
    },
    components: {
      ServerIpConfig,
      Download,
      Upload,
      SyncStatus
    }
  }
</script>

<style lang="sass" scoped>
</style>
