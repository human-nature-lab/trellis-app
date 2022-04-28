<template>
  <sync-sub-step :working="working"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry">
    {{ status.message }}
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'

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
        }
      },
      methods: {
        startWork: async function () {
          this.working = true
          this.status.message = this.$t('configuring_db')
          await DatabaseService.createDatabase()
          const queryRunner = (await DatabaseService.getDatabase()).createQueryRunner()
          try {
            await DatabaseService.createUpdatedRecordsTable(queryRunner, this.status)
            await DatabaseService.addTriggers(queryRunner, this.status)
            this.onDone()
          } catch (err) {
            this.working = false
            this.loggingService.log(err).then((result) => { this.currentLog = result })
          }
        },
        onDone: function () {
          this.working = false
          this.success = true
          this.$emit('configure-database-done')
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
