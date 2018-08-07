<template>
  <sync-sub-step :working="verifying"
                 :success="success"
                 :current-log="currentLog"
                 :ignore="ignore"
                 :retry="retry">
    Verifying the download...
  </sync-sub-step>
</template>

<script>
    import config from '../../../../config'
    import FileService from '../../../../services/file/FileService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'verify-download',
      data () {
        return {
          success: false,
          verifying: false,
          apiRoot: config.apiRoot,
          currentLog: undefined
        }
      },
      created () {
        this.verifyDownload()
      },
      props: {
        fileHash: {
          type: String,
          required: true
        },
        fileEntry: {
          type: Object,
          required: true
        },
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        verifyDownload: function () {
          this.verifying = true
          FileService.calculateMD5Hash(this.fileEntry)
            .then((md5Hash) => {
              if (md5Hash === this.fileHash) {
                this.verifying = false
                this.verificationDone()
              } else {
                this.verifying = false
                this.loggingService.log({
                  severity: 'warn',
                  message: 'Calculated hash does not match hash reported by the server.',
                  serverProvidedHash: this.fileHash,
                  calculatedMd5Hash: md5Hash
                }).then((result) => { this.currentLog = result })
              }
            })
            .catch((err) => {
              this.verifying = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        verificationDone: function () {
          this.success = true
          this.$emit('verify-download-done')
        },
        ignore: function () {
          this.loggingService.log({
            severity: 'info',
            message: 'Warning ignored by user.'
          }).then((log) => {
            this.currentLog = log
            this.verificationDone()
          })
        },
        retry: function () {
          this.currentLog = undefined
          this.verifyDownload()
        }
      },
      computed: {
      },
      components: {
        SyncSubStep
      }
    }
</script>
