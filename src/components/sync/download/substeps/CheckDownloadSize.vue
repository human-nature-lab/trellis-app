<template>
  <sync-sub-step
    :working="checking"
    :success="success"
    :current-log="currentLog"
    :cancel="stopChecking"
    :ignore="ignore"
    :retry="retry"
  >
    {{ $t('checking_space') }}
  </sync-sub-step>
</template>

<script lang="ts">
import axios from 'axios'
import SyncService from '../../../../services/SyncService'
import DeviceService from '../../../../services/device'
import formatBytesFilter from '../../../../filters/format-bytes.filter'
import SyncSubStep from '../../SyncSubStep.vue'
import LoggingService, { defaultLoggingService } from '../../../../services/logging'
export default {
  name: 'CheckDownloadSize',
  data () {
    return {
      success: false,
      checking: false,
      source: null,
      snapshotFileSize: 0,
      currentLog: undefined,
    }
  },
  created () {
    this.checkDownloadSize()
  },
  beforeDestroy () {
    this.source.cancel()
  },
  props: {
    snapshotId: {
      type: String,
      required: true,
    },
    loggingService: {
      type: LoggingService,
      required: false,
      default: () => defaultLoggingService,
    },
  },
  methods: {
    async checkDownloadSize () {
      try {
        const CancelToken = axios.CancelToken
        this.source = CancelToken.source()
        this.checking = true
        const [freeDiskSpace, snapshotFileSize] = await Promise.all([
          DeviceService.getFreeDiskSpace(),
          SyncService.getSnapshotFileSize(this.source, this.snapshotId),
        ])
        this.snapshotFileSize = snapshotFileSize
        this.checking = false
        if (this.snapshotFileSize > freeDiskSpace) {
          this.currentLog = await this.loggingService.log({
            severity: 'warn',
            message: this.$t('snapshot_requires_space', [formatBytesFilter(this.snapshotFileSize), formatBytesFilter(freeDiskSpace)]),
          })
        } else if ((this.snapshotFileSize * 5) > freeDiskSpace) {
          this.currentLog = await this.loggingService.log({
            severity: 'warn',
            message: this.$t('extracted_snapshot_requires_space', [formatBytesFilter(this.snapshotFileSize * 5), formatBytesFilter(freeDiskSpace)]),
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
        message: this.$t('warning_ignored'),
      }).then((log) => {
        this.currentLog = log
        this.onDone()
      })
    },
  },
  computed: {
  },
  components: {
    SyncSubStep,
  },
}
</script>
