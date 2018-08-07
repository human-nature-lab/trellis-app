<template>
  <sync-sub-step
    :working="working"
    :success="success"
    :current-log="currentLog"
    :ignore="ignore"
    :retry="retry">
    Checking foreign key constraints...
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'check-foreign-keys',
      data () {
        return {
          success: false,
          working: false,
          currentLog: undefined
        }
      },
      created () {
        this.checkForeignKeys()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        checkForeignKeys: function () {
          this.working = true
          DatabaseService.checkForeignKeys()
            .then(() => {
              this.working = false
              this.success = true
              this.$emit('check-foreign-keys-done')
            })
            .catch((err) => {
              this.working = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        retry: function () {
          this.currentLog = undefined
          this.checkForeignKeys()
        },
        ignore: function () {
          this.currentLog = undefined
          this.success = true
          this.$emit('check-foreign-keys-done')
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
