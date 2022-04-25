<template>
  <sync-sub-step
    :working="working"
    :success="success"
    :success-message="$t('done')"
    :current-log="currentLog"
    :cancel="stopWorking"
    :retry="retry">
    {{ $t('requesting_image_list') }}
  </sync-sub-step>
</template>

<script>
  import SyncSubStep from '../../SyncSubStep.vue'
  import LoggingService, { defaultLoggingService } from '../../../../services/logging'
  import FileService from '../../../../services/file'
  import config from 'config'
  import DeviceService from '../../../../services/device'
  import SyncService from '../../../../services/SyncService'
  import * as axios from 'axios'

  export default {
    name: 'request-image-list',
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
      updatedPhotos: {
        type: Array,
        required: true
      }
    },
    methods: {
      doWork: async function () {
        this.working = true
        try {
          const CancelToken = axios.CancelToken
          this.source = CancelToken.source()
          const imageList = await SyncService.getMissingPhotos(this.source)
          const combinedImageList = imageList.concat(this.updatedPhotos)
          this.working = false
          this.success = true
          this.$emit('request-image-list-done', combinedImageList)
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
    components: {
      SyncSubStep
    }
  }
</script>
