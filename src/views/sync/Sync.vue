<template>
  <v-col>
    <sync-status
      v-if="!needsServerConfig && !downloading && !uploading && !downloadingPhotos && !uploadingPhotos"
      :local-latest-snapshot="localLatestSnapshot"
      :updated-records-count="updatedRecordsCount"
    />
    <UploadSnapshot
      v-if="uploading || uploadingPhotos"
      :only-photos="onlyPhotos"
      @done="uploadDone"
      @cancel="uploadCanceled"
    />
    <DownloadSnapshot
      v-if="downloading || downloadingPhotos"
      :only-photos="onlyPhotos"
      @done="downloadDone"
      @cancel="downloadCanceled"
    />
    <v-row
      no-gutters
      class="pa-4"
      v-if="!needsServerConfig"
    >
      <v-col>
        <h4 class="py-2 text-center">
          {{ $t('sync') }}
        </h4>
        <v-spacer />
        <v-row
          no-gutters
          class="justify-space-around"
        >
          <v-btn
            @click="onDownload"
            :loading="downloading"
            :disabled="!enableDownload"
          >
            <v-icon>
              mdi-cloud-download
            </v-icon>
          </v-btn>
          <v-btn
            :disabled="!enableUpload"
            :loading="uploading"
            @click="onUpload"
          >
            <v-icon>
              mdi-cloud-upload
            </v-icon>
          </v-btn>
        </v-row>
      </v-col>
      <v-spacer />
      <v-col>
        <h4 class="py-2 text-center">
          {{ $t('photos') }}
        </h4>
        <v-spacer />
        <v-row
          no-gutters
          class="justify-space-around"
        >
          <v-btn
            @click="onDownloadPhotos"
            :loading="downloadingPhotos"
            :disabled="!enablePhotoDownload"
          >
            <v-icon>mdi-arrow-down</v-icon>
          </v-btn>
          <v-btn
            @click="onUploadPhotos"
            :loading="uploadingPhotos"
            :disabled="!enablePhotoDownload"
          >
            <v-icon>mdi-arrow-up</v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import AlertService from '@/services/AlertService'
import SyncStatus from '@/components/sync/SyncStatus.vue'
import DatabaseService from '@/services/database'
import DownloadSnapshot from '@/components/sync/DownloadSnapshot.vue'
import UploadSnapshot from '@/components/sync/UploadSnapshot.vue'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import DocsFiles from '@/components/documentation/DocsFiles'

export default {
  name: 'SyncView',
  components: {
    UploadSnapshot,
    SyncStatus,
    DownloadSnapshot,
  },
  mixins: [DocsLinkMixin(DocsFiles.sync.introduction)],
  data () {
    return {
      loading: true,
      uploading: false,
      downloading: false,
      downloadingPhotos: false,
      onlyPhotos: false,
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
      this.downloading = true
      this.onlyPhotos = false
    },
    onUpload () {
      this.uploading = true
      this.onlyPhotos = false
    },
    onUploadPhotos () {
      this.uploadingPhotos = true
      this.onlyPhotos = true
    },
    onDownloadPhotos () {
      this.downloadingPhotos = true
      this.onlyPhotos = true
    },
    downloadCanceled () {
      this.downloading = false
      this.downloadingPhotos = false
      // Re-init in case download was successful
      this.initComponent()
    },
    downloadDone () {
      this.downloading = false
      this.downloadingPhotos = false
      this.initComponent()
    },
    uploadCanceled () {
      this.uploading = false
      this.uploadingPhotos = false
      // Re-init in case upload was successful
      this.initComponent()
    },
    uploadDone () {
      this.uploading = false
      this.uploadingPhotos = false
      this.initComponent()
    },
  },
  computed: {
    needsServerConfig () {
      return this.serverIPAddress === undefined
    },
    enableDownload () {
      return ((this.updatedRecordsCount === 0) && this.enableAll)
    },
    enableUpload () {
      return ((this.updatedRecordsCount > 0) && this.enableAll)
    },
    enablePhotoDownload () {
      return (this.localLatestSnapshot && this.enableAll)
    },
    enableAll () {
      return (!this.loading && !this.downloading && !this.downloadingPhotos && !this.uploadingPhotos && !this.uploading)
    },
  },
}
</script>
