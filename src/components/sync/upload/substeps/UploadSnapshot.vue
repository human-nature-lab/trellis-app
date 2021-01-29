<template>
  <sync-sub-step
    :working="working"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog"
    :cancel="stopWorking"
    :retry="retry"
    :indeterminate="false"
    :progress="progress">
    {{$t('uploading')}}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
  import FileService from '../../../../services/file/FileService'
  import DatabaseService from '../../../../services/database/DatabaseService'
  import DeviceService from '../../../../services/device/DeviceService'
import { getSyncAuthentication } from '../../../../services/http/AxiosInstance'

  export default {
    name: 'upload-snapshot',
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
      },
    },
    methods: {
      async doWork () {
        this.working = true
        console.log('fileEntry', this.fileEntry)
        console.log('md5hash', this.md5hash)
        const deviceId = await DeviceService.getUUID()
        const apiRoot = await DatabaseService.getServerIPAddress()
        const syncAuth = await getSyncAuthentication()
        const uri = apiRoot + `/sync/device/${deviceId}/upload`
        try {
          await FileService.upload(uri, this.fileEntry, this.onUploadProgress, syncAuth)
          this.working = false
          this.success = true
          this.$emit('upload-snapshot-done')
        } catch (err) {
          this.loggingService.log(err).then((result) => { this.currentLog = result })
          this.working = false
        }
      },
      onUploadProgress (progressEvent) {
        //console.log(progressEvent)
        let curProgress = (progressEvent.loaded / progressEvent.total) * 100
        // Only update at 5% increments, without this the progress bar does not update
        if ((curProgress - this.progress) > 5) {
          this.progress = curProgress
        }
      },
      stopWorking () {
        this.working = false
      },
      retry () {
        this.currentLog = undefined
        this.doWork()
      }
    },
    components: {
      SyncSubStep
    }
  }
</script>
