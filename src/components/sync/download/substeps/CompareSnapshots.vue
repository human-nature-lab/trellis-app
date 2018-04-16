<template>
  <div>
    <ul>
      <li>
        Comparing snapshot with last downloaded...
        <span v-if="result === RESULTS.NO_DOWNLOAD">no local snapshot found... </span>
        <span v-if="result === RESULTS.DOWNLOAD_OLDER_UPLOAD_NEWER || result === RESULTS.DOWNLOAD_OLDER">snapshot on the server is newer... </span>
        <span v-if="result === RESULTS.DOWNLOAD_SAME_UPLOAD_OLDER">snapshot on the server is the same... </span>
        <strong v-if="result === RESULTS.DOWNLOAD_NEWER">snapshot on the server is older... </strong>
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="warning" class="yellow--text">WARNING.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
      <li v-if="result > 1 && result < 6">
        Comparing snapshot with last upload...
        <span v-if="result === RESULTS.DOWNLOAD_SAME_UPLOAD_OLDER || result === RESULTS.DOWNLOAD_OLDER">snapshot on the server is newer... </span>
        <strong v-if="result === RESULTS.DOWNLOAD_OLDER_UPLOAD_NEWER">snapshot on the server is older... </strong>
        <strong v-if="success" class="green--text">OK.</strong>
        <strong v-if="warning" class="yellow--text">WARNING.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <ul v-if="result === RESULTS.NO_DOWNLOAD">
      <li>No previous download found.</li>
    </ul>
    <ul v-if="result === RESULTS.DOWNLOAD_OLDER">
      <li>
        The last download on {{ localDownloadCreatedAt }} is older than the latest server snapshot.
      </li>
    </ul>
    <ul v-if="result < 3">
      <li>
        Download of the snapshot created at {{ serverSnapshotCreatedAt }} will begin automatically.
      </li>
    </ul>
    <ul v-if="result === RESULTS.DOWNLOAD_SAME_UPLOAD_OLDER">
      <li>
        You have already downloaded the snapshot created at {{ serverSnapshotCreatedAt }}, no download is
        necessary.
      </li>
    </ul>
    <ul v-if="result === RESULTS.DOWNLOAD_OLDER_UPLOAD_NEWER || result === RESULTS.DOWNLOAD_SAME_UPLOAD_NEWER">
      <li>
        You uploaded data at {{ localUploadCreatedAt }} that the server has not processed yet (the last
        snapshot was generated at {{ serverSnapshotCreatedAt }}). The server is currently generating a new
        snapshot. Please try again in a few minutes.
      </li>
    </ul>
    <ul v-if="result === RESULTS.DOWNLOAD_NEWER">
      <li>
        The snapshot on the server, created at {{ serverSnapshotCreatedAt }}, is older than the last
        snapshot you downloaded ({{ localDownloadCreatedAt }}). This is unexpected, proceed with caution.
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
  </div>
</template>

<script>
    import DatabaseService from '@/services/database/DatabaseService'
    import {COMPARE_SNAPSHOTS_RESULTS as RESULTS} from '@/constants'
    export default {
      name: 'compare-snapshots',
      data () {
        return {
          result: RESULTS.NONE,
          success: false,
          error: false,
          warning: false,
          checking: false,
          source: null,
          errorMessage: '',
          localDownload: null,
          localUpload: null,
          localDownloadedAt: 0,
          localUploadedAt: 0,
          serverCreatedAt: 0,
          RESULTS: RESULTS
        }
      },
      created () {
        this.compareDownload()
      },
      props: {
        serverSnapshot: Object
      },
      methods: {
        emitResults: function (result) {
          this.result = result
          this.checking = false
          if (result > 3) {
            this.warning = true
          } else {
            this.success = true
          }
          this.$emit('compare-snapshots-done', (this.result < 3), this.warning)
        },
        compareDownload: function () {
          this.checking = true
          DatabaseService.getLatestDownload().then((localDownload) => {
            if (localDownload.length === 0) {
              this.emitResults(RESULTS.NO_DOWNLOAD)
              return
            }
            this.localDownload = localDownload[0]
            this.localDownloadedAt = new Date(this.localDownload['created_at']).now()
            this.serverCreatedAt = new Date(this.serverSnapshot['created_at']).now()
            if (this.localDownloadedAt > this.serverCreatedAt) {
              this.emitResults(RESULTS.DOWNLOAD_NEWER)
              return
            }
            this.compareUpload()
          }, (error) => {
            this.error = true
            this.errorMessage = error
          })
        },
        compareUpload: function () {
          DatabaseService.getLatestUpload().then((localUpload) => {
            if (localUpload.length === 1) {
              this.localUpload = localUpload[0]
              this.localUploadedAt = new Date(this.localUpload['created_at']).now()
            }
            if (this.localDownloadedAt === this.serverCreatedAt) {
              if (this.localUploadedAt < this.serverCreatedAt) {
                this.emitResults(RESULTS.DOWNLOAD_SAME_UPLOAD_OLDER)
              } else {
                this.emitResults(RESULTS.DOWNLOAD_SAME_UPLOAD_NEWER)
              }
            } else { // Download is older
              if (this.localUploadedAt < this.serverCreatedAt) {
                this.emitResults(RESULTS.DOWNLOAD_OLDER)
              } else {
                this.emitResults(RESULTS.DOWNLOAD_OLDER_UPLOAD_NEWER)
              }
            }
          }, (error) => {
            this.error = true
            this.errorMessage = error
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
        },
        localUploadCreatedAt: function () {
          if (!this.localUpload || !this.localUpload.hasOwnProperty('created_at')) {
            return 'NONE'
          }
          return this.localUpload['created_at']
        }
      },
      components: {
      }
    }
</script>
