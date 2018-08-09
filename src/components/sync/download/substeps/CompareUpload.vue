<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :retry="retry" :ignore="ignore">
    Comparing snapshot with last upload... {{ addMessage }}
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import {COMPARE_UPLOAD_RESULTS as RESULTS} from '../../../../static/constants'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import DateService from '../../../../services/DateService'
    export default {
      name: 'compare-upload',
      data () {
        return {
          result: RESULTS.NONE,
          success: false,
          checking: false,
          localDownload: null,
          localUpload: null,
          localDownloadedAt: 0,
          localUploadedAt: 0,
          serverCreatedAt: 0,
          RESULTS: RESULTS,
          addMessage: '',
          currentLog: undefined
        }
      },
      created () {
        this.compareUpload()
      },
      props: {
        serverSnapshot: Object,
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        emitResults: function (result) {
          this.checking = false
          switch (result) {
            case RESULTS.NO_UPLOAD:
              this.success = true
              this.$emit('compare-upload-done', result)
              break
            case RESULTS.UPLOAD_OLDER:
              this.success = true
              this.$emit('compare-upload-done', result)
              break
            case RESULTS.UPLOAD_NEWER:
              this.loggingService.log({
                severity: 'warn',
                message: `You uploaded data at ${this.localUploadCreatedAt} that the server has not processed yet (the last snapshot was generated at ${this.serverSnapshotCreatedAt}). The server is currently generating a new snapshot. Please try again in a few minutes.`
              }).then((result) => { this.currentLog = result })
              break
          }
        },
        retry: function () {
          this.currentLog = undefined
          this.compareUpload()
        },
        ignore: function () {
          this.loggingService.log({
            severity: 'info',
            message: 'Warning ignored by user.'
          }).then((result) => {
            this.currentLog = result
            this.success = true
            this.$emit('compare-upload-done', result)
          })
        },
        compareUpload: function () {
          this.checking = true
          DatabaseService.getLatestUpload()
            .then((localUpload) => {
              console.log('localUpload', localUpload)
              if (localUpload && localUpload.length === 1) {
                this.localUpload = localUpload[0]
                this.localUploadedAt = new Date(this.localUpload['created_at']).now()
                if (this.localUploadedAt < this.serverCreatedAt) {
                  this.addMessage = 'snapshot on the server is newer...'
                  this.result = RESULTS.UPLOAD_OLDER
                } else {
                  this.addMessage = 'snapshot on the server is older...'
                  this.result = RESULTS.UPLOAD_NEWER
                }
              } else {
                this.addMessage = 'no upload found...'
                this.result = RESULTS.NO_UPLOAD
              }
              this.emitResults(this.result)
            })
            .catch((err) => {
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        }
      },
      computed: {
        serverSnapshotCreatedAt: function () {
          if (!this.serverSnapshot || !this.serverSnapshot.hasOwnProperty('created_at')) {
            return 'NONE'
          }
          return DateService.parseDate(this.serverSnapshot['createdAt']).format('llll')
        },
        localUploadCreatedAt: function () {
          if (!this.localUpload || !this.localUpload.hasOwnProperty('created_at')) {
            return 'NONE'
          }
          return DateService.parseDate(this.localUpload['createdAt']).format('llll')
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
