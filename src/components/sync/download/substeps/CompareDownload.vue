<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :retry="retry" :ignore="ignore">
    Comparing snapshot with last downloaded... {{ addMessage }}
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import {COMPARE_DOWNLOAD_RESULTS as RESULTS} from '../../../../static/constants'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'compare-download',
      data () {
        return {
          result: RESULTS.NONE,
          success: false,
          checking: false,
          localDownload: null,
          localDownloadedAt: 0,
          serverCreatedAt: 0,
          RESULTS: RESULTS,
          currentLog: undefined,
          addMessage: ''
        }
      },
      created () {
        this.compareDownload()
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
            case RESULTS.NO_DOWNLOAD:
              this.addMessage = 'no previous download found...'
              this.success = true
              break
            case RESULTS.DOWNLOAD_OLDER:
              this.addMessage = `the last download on ${this.localDownloadCreatedAt} is older than the latest server snapshot...`
              this.success = true
              break
            case RESULTS.DOWNLOAD_SAME:
              this.loggingService.log({
                severity: 'warn',
                message: `You have already downloaded the snapshot created at ${this.serverSnapshotCreatedAt}, no download is necessary.`
              }).then((result) => { this.currentLog = result })
              break
            case RESULTS.DOWNLOAD_NEWER:
              this.loggingService.log({
                severity: 'warn',
                message: `The snapshot on the server, created at ${this.serverSnapshotCreatedAt}, is older than the last snapshot you downloaded (${this.localDownloadCreatedAt}). This is unexpected, proceed with caution.`
              }).then((result) => { this.currentLog = result })
              break
          }
          if (this.success) {
            this.$emit('compare-download-done', result)
          }
        },
        retry: function () {
          this.currentLog = undefined
          this.compareDownload()
        },
        ignore: function () {
          this.loggingService.log({
            severity: 'info',
            message: 'Warning ignored by user.'
          }).then((result) => {
            this.currentLog = result
            this.success = true
            this.$emit('compare-download-done', this.result)
          })
        },
        compareDownload: function () {
          this.checking = true
          DatabaseService.getLatestDownload()
            .then((localDownload) => {
              if (!localDownload) {
                this.result = RESULTS.NO_DOWNLOAD
              } else {
                this.localDownload = localDownload
                this.localDownloadedAt = new Date(this.localDownload['created_at']).now()
                this.serverCreatedAt = new Date(this.serverSnapshot['created_at']).now()
                if (this.localDownloadedAt > this.serverCreatedAt) {
                  this.result = RESULTS.DOWNLOAD_NEWER
                } else if (this.localDownloadedAt === this.serverCreatedAt) {
                  this.result = RESULTS.DOWNLOAD_SAME
                } else {
                  this.result = RESULTS.DOWNLOAD_OLDER
                }
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
          return this.serverSnapshot['created_at']
        },
        localDownloadCreatedAt: function () {
          if (!this.localDownload || !this.localDownload.hasOwnProperty('created_at')) {
            return 'NONE'
          }
          return this.localDownload['created_at']
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
