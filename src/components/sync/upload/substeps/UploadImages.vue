<template>
  <sync-sub-step :working="working"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :ignore="ignore"
                 :retry="retry"
                 :cancel="stopWorking"
                 :progress="progress"
                 :indeterminate="progressIndeterminate">
    {{$t('uploading_images', [numImagesUploaded, imagesToUpload.length])}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import DeviceService from '../../../../services/device/DeviceService'
    import DatabaseService from '../../../../services/database/DatabaseService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import { makeBasicAuthHeader } from '../../../../services/util'

    export default {
      name: 'upload-images',
      data () {
        return {
          progress: 0,
          progressIndeterminate: true,
          success: false,
          working: false,
          numImagesUploaded: 0,
          currentLog: undefined
        }
      },
      created () {
        this.doWork()
      },
      props: {
        imagesToUpload: {
          type: Array,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        },
        username: {
          type: String,
          required: true
        },
        password: {
          type: String,
          required: true
        }
      },
      methods: {
        doWork: async function () {
          if (this.imagesToUpload.length === 0) {
            this.working = false
            this.onDone()
          } else {
            this.working = true
            this.progressIndeterminate = false
            const photoFile = this.imagesToUpload.pop()
            const deviceId = await DeviceService.getUUID()
            const apiRoot = await DatabaseService.getServerIPAddress()
            const uri = apiRoot + `/sync/device/${deviceId}/upload/image`
            FileService.upload(uri, photoFile, this.onUploadProgress, makeBasicAuthHeader(this.username, this.password))
              .then(() => {
                this.numImagesUploaded++
                this.progress = (this.numImagesUploaded / this.imagesToUpload.length) * 100
              })
              .catch((err) => {
                this.loggingService.log(err).then((result) => { this.currentLog = result })
                this.working = false
              })
              .finally(() => {
                if (this.working) {
                  this.doWork()
                }
              })
          }
        },
        onUploadProgress (progressEvent) {
          //console.log(progressEvent)
        },
        onDone: function () {
          this.success = true
          this.working = false
          this.$emit('upload-images-done', [this.numImagesUploaded])
        },
        retry: function () {
          this.currentLog = undefined
          this.doWork()
        },
        ignore: function () {
          this.currentLog = undefined
          this.onDone()
        },
        stopWorking: function () {
          if (this.source) {
            this.source.cancel(this.$t('operation_cancelled'))
          }
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
