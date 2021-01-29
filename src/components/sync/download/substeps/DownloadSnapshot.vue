<template>
  <sync-sub-step :working="downloading"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :cancel="stopDownload"
                 :retry="retry"
                 :indeterminate="false"
                 :progress="downloadProgress">
    {{$t('downloading_snapshot')}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import DeviceService from '../../../../services/device/DeviceService'
    import DatabaseService from '../../../../services/database/DatabaseService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import { makeBasicAuthHeader } from '../../../../services/util'
    import { getSyncAuthentication } from '../../../../services/http/AxiosInstance'
    export default {
      name: 'download-snapshot',
      data () {
        return {
          downloadProgress: 0,
          lastProgressEvent: 0,
          lastDownloadProgress: 0,
          success: false,
          downloading: false,
          source: null,
          currentLog: undefined,
          fileServicePromise: undefined
        }
      },
      created () {
        this.downloadSnapshot()
      },
      props: {
        snapshotId: {
          type: String,
          required: true
        },
        snapshotFileSize: {
          type: Number,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        },
      },
      methods: {
        downloadSnapshot: async function () {
          this.downloading = true
          const fileName = this.snapshotId + '.sql.zip'
          try {
            const deviceId = await DeviceService.getUUID()
            const apiRoot = await DatabaseService.getServerIPAddress()
            const uri = apiRoot + `/sync/device/${deviceId}/snapshot/${this.snapshotId}/download`
            const fileSystem = await FileService.requestFileSystem()
            const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'snapshots')
            const fileEntry = await FileService.getFileEntry(directoryEntry, fileName)
            const syncAuth = await getSyncAuthentication()
            this.fileServicePromise = FileService.download(uri, fileEntry, this.onDownloadProgress, syncAuth)
            await this.fileServicePromise
            this.success = true
            this.$emit('download-snapshot-done', fileEntry)
            this.downloading = false
          } catch (err) {
            this.downloading = false
            this.loggingService.log(err).then((result) => {
              this.currentLog = result
            })
          }
        },
        onDownloadProgress: function (progressEvent) {
          let curProgress = (progressEvent.loaded / progressEvent.total) * 100
          // Only update at 5% increments, without this the progress bar does not update
          if ((curProgress - this.downloadProgress) > 5) {
            this.downloadProgress = curProgress
          }
        },
        stopDownload: function () {
          if (this.fileServicePromise.hasOwnProperty('cancelDownload')) {
            this.fileServicePromise.cancelDownload()
            this.downloading = false
          }
        },
        retry: function () {
          this.currentLog = undefined
          this.downloadSnapshot()
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
