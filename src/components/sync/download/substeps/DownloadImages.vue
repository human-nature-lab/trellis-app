<template>
  <sync-sub-step :working="downloading"
                 :success-message="$t('done')"
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
    import { i18n } from '../../../../i18n'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    export default {
      name: 'download-images',
      data () {
        return {
          numConcurrentDownloads: 4,
          downloadProgress: 0,
          progressIndeterminate: true,
          success: false,
          downloading: false,
          numImagesDownloaded: 0,
          failedImages: [],
          currentLog: undefined,
          isCancelling: false
        }
      },
      created () {
        this.downloadImages()
      },
      beforeDestroy () {
        if (!this.isCancelling) {
          this.stopDownload()
        }
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
            this.isCancelling = false
            this.sources = new Map()
            const checkFinished = () => {
              if (this.sources.size === 0) {
                this.downloading = false
                this.onDone()
              }
            }
            const downloadNextOrFinish = () => {
              if (this.isCancelling || !this.downloading) {
                checkFinished()
                return
              }
              const fileName = this.imagesToDownload.pop()

              // Stop and end when done with all remaining
              if (!fileName) {
                checkFinished()
                return
              }

              // Download image
              const CancelToken = axios.CancelToken
              const source = CancelToken.source()
              this.sources.set(fileName, source)
              SyncService.downloadImage(source, fileName)
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
                  console.error(err)
                  if (err.response) {
                    // 404 Not Found is the expected result if the image isn't found
                    this.failedImages.push({
                      fileName: fileName,
                      error: `${err.response.status} ${err.response.statusText}`
                    })
                  } else {
                    this.loggingService.log(err).then((result) => { this.currentLog = result })
                    // Stop on unexpected, loggable, error, for instance a Network Error
                    this.downloading = false
                    this.isCancelling = true
                  }
                })
                .finally(() => {
                  this.sources.delete(fileName)
                  downloadNextOrFinish()
                })
            }

            for (let i = 0; i < this.numConcurrentDownloads; i++) {
              downloadNextOrFinish()
            }

          }
        },
        onDone: function () {
          this.success = true
          this.downloading = false
          if (this.failedImages.length > 0) {
            this.loggingService.log({
              severity: 'warn',
              message: this ? this.$t('server_cant_find_images', [this.failedImages.length]) : `Server cant find images ${this.failedImages.length}`
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
        },
        stopDownload () {
          // Make this cancel button idempotent
          if (this.isCancelling) return
          this.isCancelling = true
          if (this && this.sources) {
            console.log('cancelling', this.sources)
            this.sources.forEach((source) => {
              source.cancel(i18n.$t('operation_cancelled'))
            })
          }
          this.downloading = false
          this.loggingService.log({
            severity: 'info',
            message: i18n.$t('operation_cancelled')
          }).then((result) => {
            if (this) {
              this.currentLog = result
            }
          })
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
