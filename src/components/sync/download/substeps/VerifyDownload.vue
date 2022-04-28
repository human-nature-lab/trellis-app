<template>
  <sync-sub-step :working="verifying"
                 :success="success"
                 :current-log="currentLog"
                 :ignore="ignore"
                 :retry="retry">
    {{$t('verifying_download')}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    export default {
      name: 'verify-download',
      data () {
        return {
          success: false,
          verifying: false,
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
                  message: this.$t('hash_dont_match'),
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
            message: this.$t('warning_ignored')
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
      components: {
        SyncSubStep
      }
    }
</script>
