<template>
  <sync-sub-step :working="checking" :success="success" :current-log="currentLog" :retry="retry" :ignore="ignore">
    {{$t('comparing_snapshot_download')}} {{ addMessage }}
  </sync-sub-step>
</template>

<script>
    import DatabaseService from '../../../../services/database/DatabaseService'
    import {COMPARE_DOWNLOAD_RESULTS as RESULTS} from '../../../../static/constants'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging'
    import DateService from '../../../../services/DateService'
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
              this.addMessage = this.$t('no_previous_download')
              this.success = true
              break
            case RESULTS.DOWNLOAD_OLDER:
              this.addMessage = this.$t('last_download_date', [this.localDownloadCreatedAt])
              this.success = true
              break
            case RESULTS.DOWNLOAD_SAME:
              this.loggingService.log({
                severity: 'warn',
                message: this.$t('last_snapshot_date', [this.serverSnapshotCreatedAt])
              }).then((result) => { this.currentLog = result })
              break
            case RESULTS.DOWNLOAD_NEWER:
              this.loggingService.log({
                severity: 'warn',
                message: this.$t('older_snapshot', [this.serverSnapshotCreatedAt, this.localDownloadCreatedAt])
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
            message: this.$t('warning_ignored')
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
                this.localDownloadedAt = this.localDownload['snapshotCreatedAt']
                this.serverCreatedAt = new Date(this.serverSnapshot['created_at'] + 'Z')
                if (this.localDownloadedAt.getTime() > this.serverCreatedAt.getTime()) {
                  this.result = RESULTS.DOWNLOAD_NEWER
                } else if (this.localDownloadedAt.getTime() === this.serverCreatedAt.getTime()) {
                  this.result = RESULTS.DOWNLOAD_SAME
                } else {
                  this.result = RESULTS.DOWNLOAD_OLDER
                }
              }
              this.emitResults(this.result)
            })
            .catch((err) => {
              this.checking = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        }
      },
      computed: {
        serverSnapshotCreatedAt: function () {
          if (!this.serverSnapshot || !this.serverSnapshot.hasOwnProperty('created_at')) {
            return 'NONE'
          }
          return DateService.parseDate(this.serverSnapshot['created_at'] + 'Z').local().format('llll')
        },
        localDownloadCreatedAt: function () {
          if (!this.localDownload || !this.localDownload.hasOwnProperty('createdAt')) {
            return 'NONE'
          }
          return DateService.parseDate(this.localDownload['createdAt']).local().format('llll')
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>
