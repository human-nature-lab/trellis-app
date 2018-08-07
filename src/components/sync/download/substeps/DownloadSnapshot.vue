<template>
  <sync-sub-step :working="downloading"
                 success-message="DONE"
                 :success="success"
                 :current-log="currentLog"
                 :cancel="stopDownload"
                 :retry="retry"
                 :indeterminate="false"
                 :progress="downloadProgress">
    Downloading the latest snapshot...
  </sync-sub-step>
</template>

<script>
    import config from '../../../../config'
    import FileService from '../../../../services/file/FileService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'download-snapshot',
      data () {
        return {
          downloadProgress: 0,
          lastProgressEvent: 0,
          lastDownloadProgress: 0,
          success: false,
          downloading: false,
          apiRoot: config.apiRoot,
          source: null,
          currentLog: undefined,
          fileServicePromise: undefined
        }
      },
      beforeDestroy () {
        this.stopDownload()
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
        }
      },
      methods: {
        downloadSnapshot: function () {
          this.downloading = true
          const fileName = this.snapshotId + '.sql.zip'
          const uri = config.apiRoot + `/sync/snapshot/${this.snapshotId}/download`
          FileService.requestFileSystem()
            .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
            .then((directoryEntry) => FileService.getFileEntry(directoryEntry, fileName))
            .then((fileEntry) => {
              this.fileServicePromise = FileService.download(uri, fileEntry, this.onDownloadProgress)
              return this.fileServicePromise
            })
            .then((fileEntry) => {
              console.log('FileService.download -> fileEntry', fileEntry)
              this.success = true
              this.$emit('download-snapshot-done', fileEntry)
              this.downloading = false
            })
            .catch((err) => {
              this.downloading = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        onDownloadProgress: function (progressEvent) {
          let curProgress = (progressEvent.loaded / progressEvent.total) * 100
          // Only update at 5% increments, without this the progress bar does not update
          if ((curProgress - this.downloadProgress) > 5) {
            this.downloadProgress = curProgress
          }
        },
        stopDownload: function () {
          console.log('this.fileServicePromise', this.fileServicePromise)
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
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
