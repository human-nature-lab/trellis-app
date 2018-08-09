<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :cancel="stopChecking" :retry="retry">
    Establishing a connection with the server...
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import config from '../../../../config'
    import SyncService from '../../../../services/sync/SyncService'
    import TrellisAlert from '../../../TrellisAlert.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import SyncSubStep from '../../SyncSubStep.vue'
    export default {
      name: 'check-connection',
      data () {
        return {
          currentLog: undefined,
          success: false,
          error: false,
          checking: false,
          apiRoot: config.apiRoot,
          source: null
        }
      },
      created () {
        this.checkConnection()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        checkConnection: function () {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          this.checking = true
          SyncService.getHeartbeat(this.source).then(() => {
            this.success = true
            this.checking = false
            this.$emit('connection-ok')
          }).catch(() => {
            this.loggingService.log({
              severity: 'warn',
              message: `Unable to establish a connection with the server at ${this.apiRoot}`
            }).then((result) => { this.currentLog = result })
            this.error = true
            this.checking = false
          })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
          }
          this.currentLog = this.loggingService.log({
            severity: 'warn',
            message: 'Operation cancelled by the user.'
          })
          this.checking = false
        },
        retry: function () {
          this.error = false
          this.checkConnection()
        }
      },
      computed: {
      },
      components: {
        TrellisAlert,
        SyncSubStep
      }
    }
</script>
