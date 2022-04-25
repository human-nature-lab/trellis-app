<template>
  <sync-sub-step
    :indeterminate="indeterminate"
    :progress="progress"
    :working="working"
    :cancel="stopWorking"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog">
    {{$t('creating_upload')}}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging'
  import FileService from '../../../../services/file'
  import SyncService from '../../../../services/SyncService'
  import uuid from 'uuid/v4'

  export default {
    name: 'create-upload',
    data () {
      return {
        success: false,
        working: true,
        currentLog: undefined,
        indeterminate: true,
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
      }
    },
    methods: {
      doWork: async function () {
         this.working = true
        try {
          const syncId = uuid()
          const fileName = syncId + '.json'
          const fileSystem = await FileService.requestFileSystem()
          const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'upload_temp')
          const fileEntry = await FileService.getFileEntry(directoryEntry, fileName)
          const updatedPhotos = await SyncService.createUploadFile(fileEntry, this.trackProgress, this.isCancelled)
          if (this.working) {
            this.working = false
            this.success = true
            this.$emit('create-upload-done', fileEntry, updatedPhotos)
          }
        } catch (err) {
          console.error(err)
          this.loggingService.log(err).then((result) => { this.currentLog = result })
          this.working = false
        }
      },
      trackProgress: function (progress) {
        this.indeterminate = false
        this.progress = (progress.created / progress.total) * 100
      },
      isCancelled: function () {
        return (! this.working)
      },
      stopWorking: function () {
        this.working = false
        this.loggingService.log({
          severity: 'info',
          message: this.$t('operation_cancelled')
        }).then((result) => { this.currentLog = result })
      }
    },
    components: {
      SyncSubStep
    }
  }
</script>
