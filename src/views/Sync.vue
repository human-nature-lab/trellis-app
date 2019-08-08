<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row class="sync-content">
            <v-flex class="xs12">
              <sync-status
                v-if="!needsServerConfig && !downloading && !uploading && !downloadingPhotos && !uploadingPhotos"
                @login="isLoggingIn = true"
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
    <TrellisModal
      v-model="isLoggingIn"
      :title="$t('login')">
      <LoginForm @login="setSyncCredentials"/>
    </TrellisModal>
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
  import LoginForm from '../components/LoginForm'
  import { resetSyncCredentials, setSyncCredentials } from '../services/http/AxiosInstance'

  export default {
    name: 'sync',
    components: {
      ServerIpConfig,
      Download,
      Upload,
      SyncStatus,
      TrellisModal,
      LoginForm
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
        hasSetSyncCredentials: false,
        isLoggingIn: false,
        username: null,
        password: null
      }
    },
    created () {
      this.initComponent()
    },
    props: {},
    methods: {
      async initComponent () {
        await this.resetSyncCredentials()
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
      async setSyncCredentials (username, password) {
        this.username = username
        this.password = password
        setSyncCredentials(username, password)
        this.hasSetSyncCredentials = true
        this.isLoggingIn = false
      },
      async resetSyncCredentials () {
        await resetSyncCredentials()
        this.username = null
        this.password = null
        this.hasSetSyncCredentials = false
      },
      onDownload () {
        if (!this.hasSetSyncCredentials) {
          this.isLoggingIn = true
          return
        }
        this.downloadStep = 1
        this.downloading = true
      },
      onUpload () {
        if (!this.hasSetSyncCredentials) {
          this.isLoggingIn = true
          return
        }
        this.uploadStep = 1
        this.uploading = true
      },
      onUploadPhotos () {
        if (!this.hasSetSyncCredentials) {
          this.isLoggingIn = true
          return
        }
        this.uploadStep = 3
        this.uploadingPhotos = true
      },
      onDownloadPhotos () {
        if (!this.hasSetSyncCredentials) {
          this.isLoggingIn = true
          return
        }
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
