<template>
  <sync-sub-step :working="working"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :cancel="cancelImport"
                 :retry="retry"
                 :indeterminate="progressIndeterminate"
                 :progress="insertProgress">
    {{ status.message }}
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    // Additional cancelled variable not bound to the component
    let cancelled = false
    export default {
      name: 'insert-rows',
      data () {
        return {
          cancelled: false,
          success: false,
          working: false,
          progressIndeterminate: true,
          insertProgress: 0,
          currentLog: undefined,
          status: {
            message: this.$t('importing_database')
          }
        }
      },
      beforeDestroy () {
        if (!this.success) {
          this.cancelImport()
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
        },
        extractedSnapshot: {
          type: Object,
          required: true
        }
      },
      methods: {
        startWork: function () {
          this.working = true
          this.status.message = this.$t('importing_database')
          DatabaseService.importDatabase(this.queryRunner, this.extractedSnapshot, this.trackProgress, this.isCancelled, this.status)
            .then(() => {
              this.working = false
              if (this.cancelled) {
                this.loggingService.log({
                  severity: 'warn',
                  message: this.$t('operation_cancelled')
                }).then((result) => { this.currentLog = result })
              } else {
                this.onDone()
              }
            })
            .catch((err) => {
              this.working = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        cancelImport: function () {
          this.cancelled = cancelled = true
          this.status.message = this.$t('cancelling')
        },
        isCancelled: function () {
          return cancelled
        },
        onDone: function () {
          this.success = true
          this.$emit('insert-rows-done', this.queryRunner)
        },
        retry: function () {
          this.clearErrors()
          this.startWork()
        },
        trackProgress: function (progress) {
          this.insertProgress = (progress.inserted / progress.total) * 100
          if (this.insertProgress > 0) {
            this.progressIndeterminate = false
          }
        },
        clearErrors: function () {
          this.cancelled = cancelled = false
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
