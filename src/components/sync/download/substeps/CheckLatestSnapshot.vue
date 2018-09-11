<template>
  <sync-sub-step
    :working="checking"
    :success="success"
    :current-log="currentLog"
    :cancel="stopChecking"
    :retry="retry">
    Checking latest available snapshot on the server...
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import config from '../../../../config'
    import SyncService from '../../../../services/SyncService'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import SyncSubStep from '../../SyncSubStep.vue'
    export default {
      name: 'check-latest-snapshot',
      data () {
        return {
          success: false,
          checking: false,
          currentLog: undefined,
          apiRoot: config.apiRoot,
          source: null
        }
      },
      created () {
        this.checkLatestSnapshot()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        checkLatestSnapshot: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          SyncService.getLatestSnapshot(this.source).then((serverLatestSnapshot) => {
            this.checking = false
            if (Object.keys(serverLatestSnapshot).length === 0) {
              this.loggingService.log({
                severity: 'warn',
                message: 'No snapshot found on the server, contact the server administrator for a solution.'
              }).then((result) => { this.currentLog = result })
            } else {
              this.$emit('check-latest-snapshot-done', serverLatestSnapshot)
              this.success = true
            }
          }).catch((err) => {
            this.checking = false
            this.loggingService.log(err).then((result) => { this.currentLog = result })
          })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.loggingService.log({
            message: 'Operation cancelled by the user.'
          }).then((result) => { this.currentLog = result })
          this.checking = false
        },
        retry: function () {
          this.currentLog = undefined
          this.checkLatestSnapshot()
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
