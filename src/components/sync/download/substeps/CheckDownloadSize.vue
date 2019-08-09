<template>
  <sync-sub-step
    :working="checking"
    :success="success"
    :current-log="currentLog"
    :cancel="stopChecking"
    :ignore="ignore"
    :retry="retry">
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
          currentLog: undefined,
          promises: new Set()
        }
      },
      created () {
        this.checkDownloadSize()
      },
      beforeDestroy () {
        for (const promise of this.promises) {
          Promise.reject(promise)
        }
      },
      props: {
        snapshotId: {
          type: String,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          default: () => defaultLoggingService
        }
      },
      methods: {
        async checkDownloadSize () {
          try {
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            this.checking = true
            let p = DeviceService.getFreeDiskSpace()
            this.promises.add(p)
            let freeDiskSpace = await p
            this.promises.delete(p)
            if (!this.checking) return
            p = await SyncService.getSnapshotFileSize(this.source, this.snapshotId)
            this.promises.add(p)
            this.snapshotFileSize = await p
            this.promises.delete(p)
            this.checking = false
            if (this.snapshotFileSize > freeDiskSpace) {
              this.currentLog = await this.loggingService.log({
                severity: 'warn',
                message: this.$t('snapshot_requires_space', [formatBytesFilter(this.snapshotFileSize), formatBytesFilter(freeDiskSpace)])
              })
            } else if ((this.snapshotFileSize * 5) > freeDiskSpace) {
              this.currentLog = await this.loggingService.log({
                severity: 'warn',
                message: this.$t('extracted_snapshot_requires_space', [formatBytesFilter(this.snapshotFileSize * 5), formatBytesFilter(freeDiskSpace)])
              })
            } else {
              this.onDone()
            }
          } catch (err) {
            defaultLoggingService.log(err)
          }
        },
        stopChecking () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
          this.checking = false
        },
        onDone () {
          this.success = true
          this.$emit('check-download-size-done', this.snapshotFileSize)
        },
        retry () {
          this.currentLog = undefined
          this.checkDownloadSize()
        },
        ignore () {
          this.loggingService.log({
            severity: 'info',
            message: this.$t('warning_ignored')
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
