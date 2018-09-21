<template>
  <sync-sub-step
    :indeterminate="true"
    :working="working"
    :success="success"
    success-message="DONE"
    :current-log="currentLog"
    :retry="retry">
    {{$t('calculating_hash')}}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
  import FileService from '../../../../services/file/FileService'

  export default {
    name: 'calculate-hash',
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
      },
      fileEntry: {
        type: Object,
        required: true
      }
    },
    methods: {
      doWork: async function () {
        this.working = true
        try {
          const md5hash = await FileService.calculateMD5Hash(this.fileEntry)
          this.working = false
          this.success = true
          this.$emit('calculate-hash-done', md5hash)
        } catch (err) {
          console.error(err)
          this.loggingService.log(err).then((result) => { this.currentLog = result })
          this.working = false
        }
      },
      retry: function () {
        this.currentLog = undefined
        this.doWork()
      }
    },
    components: {
      SyncSubStep
    }
  }
</script>
