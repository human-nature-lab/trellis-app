<template>
  <sync-sub-step :success-message="$t('done')"
                 :working="working"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry">
    {{$t('emptying_snapshots')}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'empty-snapshots-directory',
      data () {
        return {
          success: false,
          working: false,
          currentLog: undefined
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
        startWork: function () {
          this.working = true
          FileService.requestFileSystem()
            .then((fileSystem) => FileService.getDirectoryEntry(fileSystem, 'snapshots'))
            .then((directoryEntry) => FileService.emptyDirectory(directoryEntry))
            .then(() => {
              this.working = false
              this.success = true
              this.workDone()
            })
            .catch((err) => {
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        workDone: function () {
          this.$emit('empty-snapshots-directory-done')
        },
        retry: function () {
          this.error = false
          this.warning = false
          this.startWork()
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
