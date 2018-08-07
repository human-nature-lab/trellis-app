<template>
  <sync-sub-step :working="removing"
                 success-message="DONE"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry">
    Removing previous database...
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'remove-database',
      data () {
        return {
          success: false,
          removing: false,
          currentLog: undefined
        }
      },
      created () {
        this.removeDatabase()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        removeDatabase: function () {
          this.removing = true
          DatabaseService.removeDatabase()
            .then(() => {
              this.removing = false
              this.success = true
              this.$emit('remove-database-done')
            })
            .catch((err) => {
              this.removing = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        retry: function () {
          this.currentLog = undefined
          this.removeDatabase()
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
