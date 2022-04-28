<template>
  <sync-sub-step :working="checking"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :ignore="ignore"
                 :stop="stopChecking"
                 :retry="retry">
    {{$t('calculating_size')}}
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import SyncService from '../../../../services/SyncService'
    import DeviceService from '../../../../services/device'
    import formatBytesFilter from '../../../../filters/format-bytes.filter'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    export default {
      name: 'calculate-image-size',
      data () {
        return {
          success: false,
          checking: false,
          source: null,
          photosFound: 0,
          logs: []
        }
      },
      created () {
        this.calculateImageSize()
      },
      props: {
        imagesToDownload: {
          type: Array,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        calculateImageSize: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          Promise.all([
            DeviceService.getFreeDiskSpace(),
            SyncService.getImageFileList(this.source, this.imagesToDownload)
          ])
            .then((results) => {
              this.checking = false
              const freeDiskSpace = results[0]
              const serverList = results[1]
              let totalImageSize = serverList['total_size']
              let photosRequested = serverList['photos_requested']
              this.photosFound = serverList['photos_found']
              let warning = false
              if (this.photosFound < photosRequested) {
                warning = true
                this.loggingService.log({
                  severity: 'warn',
                  message: this.$t('requested_images_found_images', [photosRequested, this.photosFound])
                }).then((result) => { this.logs.push(result) })
              }
              if (totalImageSize > freeDiskSpace) {
                warning = true
                this.loggingService.log({
                  severity: 'warn',
                  message: this.$t('images_require_space', [formatBytesFilter(totalImageSize), formatBytesFilter(freeDiskSpace)])
                }).then((result) => { this.logs.push(result) })
              }
              if (!warning) {
                this.onDone()
              }
            }).catch((err) => {
              this.checking = false
              this.loggingService.log(err).then((result) => { this.logs.push(result) })
            })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
          this.checking = false
        },
        onDone: function () {
          this.success = true
          this.$emit('calculate-image-size-done', this.photosFound)
        },
        retry: function () {
          this.logs = []
          this.calculateImageSize()
        },
        ignore: function () {
          this.logs.pop()
          if (this.logs.length === 0) {
            this.onDone()
          }
        }
      },
      computed: {
        currentLog: function () {
          if (this.logs.length === 0) {
            return undefined
          }
          return this.logs[this.logs.length - 1]
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
