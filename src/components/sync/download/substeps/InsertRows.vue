<template>
  <sync-sub-step :working="working"
                 success-message="DONE"
                 :success="success"
                 :current-log="currentLog"
                 :cancel="cancelImport"
                 :retry="retry"
                 :indeterminate="progressIndeterminate"
                 :progress="insertProgress">
    {{ workMessage }}
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
          workMessage: 'Importing database...',
          cancelled: false,
          success: false,
          working: false,
          progressIndeterminate: false,
          insertProgress: 0,
          currentLog: undefined
        }
      },
      beforeDestroy () {
        this.cancelImport()
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
        extractedSnapshot: {
          type: Object,
          required: true
        }
      },
      methods: {
        startWork: function () {
          this.working = true
          this.workMessage = 'Importing database...'
          DatabaseService.importDatabase(this.extractedSnapshot, this.trackProgress, this.isCancelled)
            .then(() => {
              this.working = false
              if (this.cancelled) {
                this.loggingService.log({
                  severity: 'warn',
                  message: 'Importing database cancelled by user.'
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
          this.workMessage = 'Rolling back transaction...'
        },
        isCancelled: function () {
          return cancelled
        },
        onDone: function () {
          this.success = true
          this.$emit('insert-rows-done')
        },
        retry: function () {
          this.clearErrors()
          this.startWork()
        },
        trackProgress: function (progress) {
          this.insertProgress = (progress.inserted / progress.total) * 100
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
