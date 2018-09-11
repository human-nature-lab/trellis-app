<template>
  <sync-sub-step
    :working="working"
    :success="success"
    success-message="OK"
    :current-log="currentLog"
    :cancel="stopWorking"
    :retry="retry">
    Verifying upload...
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
  import FileService from '../../../../services/file/FileService'
  import config from '../../../../config'
  import DeviceService from '../../../../services/device/DeviceService'
  import SyncService from '../../../../services/SyncService'

  export default {
    name: 'verify-upload',
    data () {
      return {
        success: false,
        working: true,
        currentLog: undefined,
        progress: 0
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
      },
      fileEntry: {
        type: Object,
        required: true
      },
      md5hash: {
        type: String,
        required: true
      }
    },
    methods: {
      doWork: async function () {
        this.working = true
        try {
          await SyncService.verifyUpload(this.fileEntry, this.md5hash)
          this.working = false
          this.success = true
          this.$emit('verify-upload-done')
        } catch (err) {
          this.loggingService.log(err).then((result) => { this.currentLog = result })
          this.working = false
        }
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
