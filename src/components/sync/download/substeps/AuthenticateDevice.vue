<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :cancel="stopChecking" :retry="retry">
    {{$t('device_authenticating')}}
  </sync-sub-step>
</template>

<script>
    import axios from 'axios'
    import config from '@/config'
    import SyncService from '../../../../services/SyncService'
    import DeviceService from '../../../../services/device/DeviceService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'authenticate-device',
      data () {
        return {
          success: false,
          checking: true,
          apiRoot: config.apiRoot,
          source: null,
          currentLog: undefined
        }
      },
      created () {
        this.authenticate()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        authenticate: function () {
          DeviceService.getUUID().then((deviceId) => {
            const CancelToken = axios.CancelToken
            this.source = CancelToken.source()
            this.checking = true
            SyncService.authenticate(this.source, deviceId).then(() => {
              this.success = true
              this.checking = false
              this.$emit('authentication-ok')
            }).catch((err) => {
              this.checking = false
              if (err.response && err.response.status === 401) {
                // Expected result if the device hasn't been added to the server
                this.loggingService.log({
                  severity: 'warn',
                  message: 'The device was not found on the server, please see an administrator for a resolution.'
                }).then((result) => { this.currentLog = result })
              } else {
                this.loggingService.log(err).then((result) => { this.currentLog = result })
              }
            })
          })
        },
        stopChecking: function () {
          if (this.source) {
            this.source.cancel('Operation cancelled by the user.')
            this.loggingService.log({
              severity: 'warn',
              message: 'Operation cancelled by the user.'
            }).then((result) => { this.currentLog = result })
          }
          this.checking = false
        },
        retry: function () {
          this.currentLog = undefined
          this.authenticate()
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
