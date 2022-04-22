<template>
  <sync-sub-step
    :working="checking"
    :success="success"
    :current-log="currentLog"
    :cancel="stopChecking"
    :retry="retry"
    :ignore="ignore">
    {{$t('comparing_snapshot_upload')}}
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import SyncService from '../../../../services/SyncService'
    import DeviceService from '../../../../services/device'
    import DatabaseService from '../../../../services/database/DatabaseService'
    import {COMPARE_UPLOAD_RESULTS as RESULTS} from '../../../../static/constants'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    import SyncSubStep from '../../SyncSubStep.vue'
    import DateService from '../../../../services/DateService'
    export default {
      name: 'compare-upload',
      data () {
        return {
          result: RESULTS.NONE,
          success: false,
          checking: false,
          RESULTS: RESULTS,
          currentLog: undefined,
          source: null
        }
      },
      created () {
        this.compareUpload()
      },
      props: {
        serverSnapshot: Object,
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        retry: function () {
          this.currentLog = undefined
          this.compareUpload()
        },
        ignore: function () {
          this.loggingService.log({
            severity: 'info',
            message: this.$t('warning_ignored')
          }).then((result) => {
            this.currentLog = result
            this.success = true
            this.$emit('compare-upload-done', result)
          })
        },
        compareUpload: async function () {
          this.checking = true
          try {
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            const deviceId = await DeviceService.getUUID()
            const pendingUploads = await SyncService.getPendingUploads(this.source)
            let pendingFromThisDevice = 0
            for (let i = 0; i < pendingUploads.length; i++) {
              if (pendingUploads[i]['device_id'] === deviceId) {
                pendingFromThisDevice++
              }
            }

            this.checking = false
            if  (pendingFromThisDevice > 0) {
              this.result = RESULTS.PENDING_THIS_DEVICE
              this.loggingService.log({
                severity: 'warn',
                message: this.$t('pending_uploads_device', [pendingFromThisDevice])
              }).then((result) => { this.currentLog = result })
            } else if (pendingUploads.length > 0) {
              this.result = RESULTS.PENDING_OTHER
              this.loggingService.log({
                severity: 'warn',
                message: this.$t('pending_uploads', [pendingUploads.length])
              }).then((result) => { this.currentLog = result })
            } else {
              this.result = RESULTS.NONE_PENDING
              this.success = true
              this.$emit('compare-upload-done', this.result)
            }
          } catch (err) {
            this.checking = false
            this.loggingService.log(err).then((result) => { this.currentLog = result })
          }
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
          this.loggingService.log({
            message: this.$t('operation_cancelled')
          }).then((result) => { this.currentLog = result })
          this.checking = false
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
