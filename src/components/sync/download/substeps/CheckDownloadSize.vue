<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :cancel="stopChecking" :ignore="ignore" :retry="retry">
    {{$t('checking_space')}}
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import SyncService from '../../../../services/SyncService'
    import DeviceService from '../../../../services/device/DeviceService'
    import formatBytesFilter from '../../../../filters/format-bytes.filter'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'check-download-size',
      data () {
        return {
          success: false,
          checking: false,
          source: null,
          snapshotFileSize: 0,
          currentLog: undefined
        }
      },
      created () {
        this.checkDownloadSize()
      },
      props: {
        snapshotId: {
          type: String,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        checkDownloadSize: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          let freeDiskSpace = 0
          DeviceService.getFreeDiskSpace()
            .then((result) => { freeDiskSpace = result })
            .then(() => SyncService.getSnapshotFileSize(this.source, this.snapshotId))
            .then((snapshotFileSize) => {
              this.checking = false
              this.snapshotFileSize = snapshotFileSize
              if (snapshotFileSize > freeDiskSpace) {
                this.loggingService.log({
                  severity: 'warn',
                  message: `The snapshot is ${formatBytesFilter(snapshotFileSize)} and this device only has ${formatBytesFilter(freeDiskSpace)} free.`
                }).then((result) => { this.currentLog = result })
              } else if ((snapshotFileSize * 5) > freeDiskSpace) {
                this.loggingService.log({
                  severity: 'warn',
                  message: `The extracted snapshot requires ~${formatBytesFilter(snapshotFileSize * 5)} and this device only has ${formatBytesFilter(freeDiskSpace)} free.`
                }).then((result) => { this.currentLog = result })
              } else {
                this.onDone()
              }
            }).catch((err) => {
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.checking = false
        },
        onDone: function () {
          this.success = true
          this.$emit('check-download-size-done', this.snapshotFileSize)
        },
        retry: function () {
          this.currentLog = undefined
          this.checkDownloadSize()
        },
        ignore: function () {
          this.loggingService.log({
            severity: 'info',
            message: 'Warning ignored by user.'
          }).then((log) => {
            this.currentLog = log
            this.onDone()
          })
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
