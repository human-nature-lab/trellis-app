<template>
  <sync-sub-step
    :indeterminate="true"
    :working="working"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog"
    :retry="retry">
    {{$t('emptying_uploads')}}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging'
  import FileService from '../../../../services/file'

  export default {
    name: 'empty-uploads-directory',
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
      doWork: async function () {
        this.working = true
        try {
          const filesystem = await FileService.requestFileSystem()
          const directoryEntry = await FileService.getDirectoryEntry(filesystem, 'upload_temp')
          await FileService.emptyDirectory(directoryEntry)
          if (this.working) {
            this.working = false
            this.success = true
            this.$emit('empty-uploads-directory-done')
          }
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
