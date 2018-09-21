<template>
  <sync-sub-step :working="working"
                 success-message="DONE"
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
      name: 'configure-database',
      data () {
        return {
          success: false,
          working: false,
          currentLog: undefined,
          status: {
            message: this.$t('configuring_db')
          }
        }
      },
      created () {
        this.startWork()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        },
        queryRunner: {
          type: Object,
          required: true
        }
      },
      methods: {
        startWork: async function () {
          this.working = true
          this.status.message = this.$t('configuring_db')
          try {
            await DatabaseService.createUpdatedRecordsTable(this.queryRunner, this.status)
            await DatabaseService.addTriggers(this.queryRunner, this.status)
            this.onDone()
          } catch (err) {
            this.working = false
            this.loggingService.log(err).then((result) => { this.currentLog = result })
          }
        },
        onDone: function () {
          this.working = false
          this.success = true
          this.$emit('configure-database-done', this.queryRunner)
        },
        retry: function () {
          this.clearErrors()
          this.startWork()
        },
        clearErrors: function () {
          this.currentLog = undefined
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
