<template>
  <sync-sub-step
    :working="working"
    :success="success"
    success-message="DONE"
    :current-log="currentLog"
    :cancel="stopWorking"
    :retry="retry">
    Uploading snapshot...
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'

  export default {
    name: 'upload-snapshot',
    data () {
      return {
        success: false,
        working: true,
        currentLog: undefined
      }
    },
    created () {
      this.doWork()
    },
    props: {
      loggingService: {
        type: LoggingService,
        required: false,
        'default': function () { return defaultLoggingService }
      }
    },
    methods: {
      doWork: function () {
        this.working = true
        setTimeout(() => {
          this.working = false
          this.success = true
          this.$emit('upload-snapshot-done')
        }, 2000)
      },
      stopWorking: function () {
        this.working = false
      },
      retry: function () {
        this.currentLog = undefined
        this.doWork()
      }
    },
    computed: {
    },
    components: {
      SyncSubStep
    }
  }
</script>
