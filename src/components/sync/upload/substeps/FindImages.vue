<template>
  <sync-sub-step
    :working="working"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog"
    :cancel="stopWorking"
    :progress="progress"
    :indeterminate="progressIndeterminate"
    :retry="retry">
    {{ $t('finding_images') }}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
  import FileService from '../../../../services/file/FileService'

  export default {
    name: 'find-images',
    data () {
      return {
        success: false,
        working: true,
        currentLog: undefined,
        fileList: [],
        progress: 0,
        progressIndeterminate: true
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
      imageList: {
        type: Array,
        required: true
      }
    },
    methods: {
      doWork: async function () {
        this.working = true
        this.progressIndeterminate = false
        try {
          for (let i = 0; i < this.imageList.length; i++) {
            let fileName = this.imageList[i]
            try {
              let photoFile = await FileService.getPhoto(fileName)
              this.fileList.push(photoFile)
            } catch (err) {
              // File not found
            }
            this.progress = ((i / this.imageList.length) * 100)
          }
          this.working = false
          this.success = true
          this.$emit('find-images-done', this.fileList)
        } catch (err) {
          console.error(err)
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
    components: {
      SyncSubStep
    }
  }
</script>
