<template>
  <sync-sub-step :success-message="$t('done')"
                 :working="extracting"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry"
                 :indeterminate="progressIndeterminate"
                 :progress="extractProgress">
    {{$t('extracting_snapshot')}}
  </sync-sub-step>
</template>

<script>
    import ZipService from '../../../../services/zip'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    export default {
      name: 'extract-snapshot',
      data () {
        return {
          success: false,
          extracting: false,
          progressIndeterminate: true,
          extractProgress: 0.0,
          currentLog: undefined
        }
      },
      created () {
        this.extractSnapshot()
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
        extractSnapshot: function () {
          this.extracting = true
          ZipService.unzipFile(this.fileEntry, this.progressCallback)
            .then((unzippedFile) => {
              console.log('unzippedFile', unzippedFile)
              this.extracting = false
              this.success = true
              this.$emit('extract-snapshot-done', unzippedFile)
            })
            .catch((err) => {
              this.extracting = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        progressCallback: function (progressEvent) {
          /* This gets called for each fileEntry returned. In our case, where we're unzipping only one file, we won't
             see the progress bar update. */
          this.progressIndeterminate = false
          this.extractProgress = (progressEvent.loaded / progressEvent.total) * 100
        },
        retry: function () {
          this.currentLog = undefined
          this.extractSnapshot()
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
