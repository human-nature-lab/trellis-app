<template>
  <sync-sub-step :working="downloading"
                 success-message="DONE"
                 :success="success"
                 :current-log="currentLog"
                 :ignore="ignore"
                 :retry="retry"
                 :cancel="stopDownload"
                 :progress="downloadProgress"
                 :indeterminate="progressIndeterminate">
    {{$t('downloading_images', [numImagesDownloaded, numImagesFound])}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import SyncService from '../../../../services/SyncService'
    import axios from 'axios'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'download-images',
      data () {
        return {
          downloadProgress: 0,
          progressIndeterminate: true,
          success: false,
          downloading: false,
          numImagesDownloaded: 0,
          failedImages: [],
          currentLog: undefined
        }
      },
      created () {
        this.downloadImages()
      },
      props: {
        imagesToDownload: {
          type: Array,
          required: true
        },
        numImagesFound: {
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
        downloadImages: function () {
          if (this.imagesToDownload.length === 0) {
            this.downloading = false
            this.onDone()
          } else {
            this.downloading = true
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            const fileName = this.imagesToDownload.pop()
            SyncService.downloadImage(this.source, fileName)
              .then((response) => {
                let photo = response.data
                let fileSize = Number(response.headers['content-length'])
                return FileService.writeFile('photos', photo, fileName, fileSize)
              })
              .then(() => {
                this.progressIndeterminate = false
                this.numImagesDownloaded++
                this.downloadProgress = (this.numImagesDownloaded / this.numImagesFound) * 100
                if (this.downloadProgress > 0) {
                  this.progressIndeterminate = false
                }
              })
              .catch((err) => {
                if (err.response) {
                  // 404 Not Found is the expected result if the image isn't found
                  this.failedImages.push({
                    fileName: fileName,
                    error: `${err.response.status} ${err.response.statusText}`
                  })
                } else {
                  this.loggingService.log(err).then((result) => { this.currentLog = result })
                }
              })
              .finally(() => {
                if (this.downloading) {
                  this.downloadImages()
                }
              })
          }
        },
        onDone: function () {
          this.success = true
          this.downloading = false
          if (this.failedImages.length > 0) {
            this.loggingService.log({
              severity: 'warn',
              message: this.$t('server_cant_find_images', [this.failedImages.length])
              // fullMessage: JSON.stringify(this.failedImages, null, 2)
            }).then((result) => {
              console.warn('Failed images', this.failedImages)
              this.currentLog = result
              this.$emit('download-images-done', [this.numImagesDownloaded])
            })
          } else {
            this.$emit('download-images-done', [this.numImagesDownloaded])
          }
        },
        retry: function () {
          this.currentLog = undefined
          this.downloadImages()
        },
        ignore: function () {
          this.currentLog = undefined
          this.onDone()
        },
        stopDownload: function () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
          this.downloading = false
          this.loggingService.log({
            severity: 'info',
            message: this.$t('operation_cancelled')
          }).then((result) => { this.currentLog = result })
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
