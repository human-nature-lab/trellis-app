<template>
  <sync-sub-step :working="removing"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry">
    {{ status.message }}
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
          currentLog: undefined,
          status: {
            message: this.$t('removing_db')
          }
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
          DatabaseService.removeDatabase(this.status)
            .then((queryRunner) => {
              this.removing = false
              this.success = true
              this.$emit('remove-database-done', queryRunner)
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
      components: {
        SyncSubStep
      }
    }
</script>
