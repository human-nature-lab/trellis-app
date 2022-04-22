<template>
  <sync-sub-step
    :indeterminate="true"
    :working="working"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog"
    :retry="retry">
    {{$t('compressing_upload')}}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging'
  import ZipService from '../../../../services/zip/ZipService'
  import FileService from '../../../../services/file/FileService'

  export default {
    name: 'compress-upload',
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
          console.log('compressing upload')
          const filesystem = await FileService.requestFileSystem()
          const fromDirectoryEntry = await FileService.getDirectoryEntry(filesystem, 'upload_temp')
          const toDirectoryEntry = await FileService.getDirectoryEntry(filesystem, 'uploads')
          const toFileName = this.fileEntry.name + '.zip'
          await ZipService.zipFile(fromDirectoryEntry, toDirectoryEntry, toFileName)
          const compressedFileEntry = await FileService.getFileEntry(toDirectoryEntry, toFileName)
          console.log('compressedFileEntry', compressedFileEntry)
          if (this.working) {
            this.working = false
            this.success = true
            this.$emit('compress-upload-done', compressedFileEntry)
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
