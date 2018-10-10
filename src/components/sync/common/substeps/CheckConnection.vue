<template>
  <sync-sub-step
    :working="checking"
    :success="success"
    :current-log="currentLog"
    :cancel="stopChecking"
    :retry="retry">
    {{$t('establishing_connection')}}
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import config from '../../../../config'
    import SyncService from '../../../../services/SyncService'
    import DatabaseService from '../../../../services/database/DatabaseService'
    import TrellisAlert from '../../../TrellisAlert.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import SyncSubStep from '../../SyncSubStep.vue'
    export default {
      name: 'check-connection',
      data () {
        return {
          currentLog: undefined,
          success: false,
          checking: false,
          source: null,
          apiRoot: '[unknown]'
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
        checkConnection: async function () {
          this.checking = true
          try {
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            this.apiRoot = await DatabaseService.getServerIPAddress()
            await SyncService.getHeartbeat(this.source)
            this.checking = false
            this.success = true
            this.$emit('connection-ok')
          } catch (err) {
            this.checking = false
            this.currentLog = await this.loggingService.log({
              severity: 'warn',
              message: this.$t('unable_to_establish_connection', [this.apiRoot])
            })
          }
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
          this.currentLog = this.loggingService.log({
            severity: 'warn',
            message: this.$t('operation_cancelled')
          })
          this.checking = false
        },
        retry: function () {
          this.currentLog = undefined
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
