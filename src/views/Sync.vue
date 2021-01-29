<template>
  <v-container fill-height justify-start>
    <v-col>
      <v-container>
        <v-row>
          <v-flex class="xs12">
            <sync-status
              v-if="!needsServerConfig && !downloading && !uploading && !downloadingPhotos && !uploadingPhotos"
              :local-latest-snapshot="localLatestSnapshot"
              :updated-records-count="updatedRecordsCount">
            </sync-status>
            <upload
              v-if="uploading || uploadingPhotos"
              :username="username"
              :password="password"
              :init-upload-step="uploadStep"
              @upload-done="uploadDone"
              @upload-cancelled="uploadCancelled">
            </upload>
            <download
              v-if="downloading || downloadingPhotos"
              :password="password"
              :username="username"
              :init-download-step="downloadStep"
              @download-done="downloadDone"
              @download-cancelled="downloadCancelled">
            </download>
          </v-flex>
        </v-row>
        <v-row
          v-if="!needsServerConfig"
          class="sync-footer">
          <v-flex class="xs6 text-xs-left">
            <v-btn :disabled="!enableUpload"
                    :loading="uploading"
                    @click="onUpload">
              <v-icon>mdi-cloud-upload</v-icon>
            </v-btn>
            <v-btn @click="onUploadPhotos"
                    :loading="uploadingPhotos"
                    :disabled="!enablePhotoDownload">
              <v-icon>mdi-collections</v-icon>
              <v-icon>mdi-arrow-up</v-icon>
            </v-btn>
          </v-flex>
          <v-flex class="xs6 text-xs-right">
            <v-btn @click="onDownload"
                    :loading="downloading"
                    :disabled="!enableDownload">
              <v-icon>mdi-cloud-download</v-icon>
            </v-btn>
            <v-btn @click="onDownloadPhotos"
                    :loading="downloadingPhotos"
                    :disabled="!enablePhotoDownload">
              <v-icon>mdi-collections</v-icon>
              <v-icon>mdi-arrow-down</v-icon>
            </v-btn>
          </v-flex>
        </v-row>
      </v-container>
    </v-col>
    <LoginModal />
  </v-container>
</template>

<script>
  import AlertService from '../services/AlertService'
  import SyncStatus from '../components/sync/SyncStatus'
  import DatabaseService from '../services/database/DatabaseService'
  import Download from '../components/sync/download/Download'
  import Upload from '../components/sync/upload/Upload'
  import ServerIpConfig from './ServerIPConfig'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import DocsFiles from '../components/documentation/DocsFiles'
  import TrellisModal from '../components/TrellisModal'
  import LoginModal from '../components/login/LoginModal'
  import { resetSyncCredentials, setSyncCredentials } from '../services/http/AxiosInstance'

  export default {
    name: 'sync',
    components: {
      ServerIpConfig,
      Download,
      Upload,
      SyncStatus,
      TrellisModal,
      LoginModal,
    },
    mixins: [DocsLinkMixin(DocsFiles.sync.introduction)],
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
        updatedRecordsCount: null,
      }
    },
    created () {
      this.initComponent()
    },
    props: {},
    methods: {
      async initComponent () {
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
      async onServerIPConfigDone () {
        this.serverIPAddress = await DatabaseService.getServerIPAddress()
      },
      onDownload () {
        this.downloadStep = 1
        this.downloading = true
      },
      onUpload () {
        this.uploadStep = 1
        this.uploading = true
      },
      onUploadPhotos () {
        this.uploadStep = 3
        this.uploadingPhotos = true
      },
      onDownloadPhotos () {
        this.downloadStep = 4
        this.downloadingPhotos = true
      },
      downloadCancelled () {
        this.downloading = false
        this.downloadingPhotos = false
        this.uploadingPhotos = false
        // Re-init in case download was successful
        this.initComponent()
      },
      downloadDone () {
        this.downloading = false
        this.downloadingPhotos = false
        this.initComponent()
      },
      uploadCancelled () {
        this.uploading = false
        this.uploadingPhotos = false
        // Re-init in case upload was successful
        this.initComponent()
      },
      uploadDone () {
        this.uploading = false
        this.uploadingPhotos = false
        this.initComponent()
      }
    },
    computed: {
      needsServerConfig () {
        return this.serverIPAddress === undefined
      },
      enableDownload () {
        return ( (this.updatedRecordsCount === 0) && this.enableAll )
      },
      enableUpload () {
        return ( (this.updatedRecordsCount > 0) && this.enableAll )
      },
      enablePhotoDownload () {
        return ( this.localLatestSnapshot && this.enableAll )
      },
      enableAll () {
        return ( !this.loading && !this.downloading && !this.downloadingPhotos && !this.uploadingPhotos && !this.uploading )
      }
    }
  }
</script>
