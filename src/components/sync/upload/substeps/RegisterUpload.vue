<template>
  <sync-sub-step
    success-message="DONE"
    :working="working"
    :success="success"
    :current-log="currentLog"
    :retry="retry">
    {{$t('registering_upload')}}
  </sync-sub-step>
</template>

<script>
  import SyncService from '../../../../services/SyncService'
  import Sync from '../../../../entities/trellis-config/Sync'
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'

  export default {
    name: 'register-upload',
    data () {
      return {
        success: false,
        working: false,
        currentLog: undefined
      }
    },
    created () {
      this.registerUpload()
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
      registerUpload: async function () {
        this.working = true
        try {
          await SyncService.registerSuccessfulSync(this.sync)
          await SyncService.markUpdatedRowsAsUploaded()
          this.working = false
          this.success = true
          this.$emit('register-upload-done')
        } catch (err) {
          this.working = false
          this.loggingService.log(err).then((result) => { this.currentLog = result })
        }
      },
      retry: function () {
        this.currentLog = undefined
        this.registerUpload()
      }
    },
    components: {
      SyncSubStep
    }
  }
</script>
