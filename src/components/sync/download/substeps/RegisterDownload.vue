<template>
  <sync-sub-step
    success-message="DONE"
    :working="working"
    :success="success"
    :current-log="currentLog"
    :retry="retry">
    Registering successful download...
  </sync-sub-step>
</template>

<script>
    import SyncService from '../../../../services/SyncService'
    import Sync from '../../../../entities/trellis-config/Sync'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'register-download',
      data () {
        return {
          success: false,
          working: false,
          currentLog: undefined
        }
      },
      created () {
        this.registerDownload()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        },
        sync: {
          type: Sync,
          required: true
        }
      },
      methods: {
        registerDownload: async function () {
          this.working = true
          try {
            // Register the sync as successful
            await SyncService.registerSuccessfulSync(this.sync)
            this.working = false
            this.success = true
            this.$emit('register-download-done')
          } catch (err) {
            this.working = false
            this.loggingService.log(err).then((result) => { this.currentLog = result })
          }
        },
        retry: function () {
          this.currentLog = undefined
          this.registerDownload()
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
