<template>
  <div class="download">
    <div class="download-content">
        <v-stepper v-model="downloadStep">
          <v-stepper-header>
            <v-stepper-step step="1">Connecting</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2">Downloading latest snapshot</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Inserting new data</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <download-step
                title="Connecting"
                v-bind:continue-status="continueStatusArray[0]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <check-connection
                  v-if="downloadSubStep > 0"
                  v-on:connection-ok="downloadSubStep = 2"></check-connection>
                <authenticate-device
                  v-if="downloadSubStep > 1"
                  v-on:authentication-ok="downloadSubStep = 3"></authenticate-device>
                <check-latest-snapshot
                  v-if="downloadSubStep > 2"
                  v-on:check-latest-snapshot-done="checkLatestSnapshotDone"></check-latest-snapshot>
                <compare-snapshots
                  v-if="downloadSubStep > 3"
                  v-bind:server-snapshot="serverSnapshot"
                  v-on:compare-snapshots-done="compareSnapshotsDone"></compare-snapshots>
              </download-step>
            </v-stepper-content>
            <v-stepper-content step="2">
              <download-step
                title="Downloading"
                v-bind:continue-status="continueStatusArray[1]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <check-download-size
                  v-if="downloadStep > 1"
                  v-bind:snapshotId="serverSnapshotId">
                </check-download-size>
              </download-step>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-card color="grey lighten-3" class="mb-5" height="200px"></v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
    </div>
  </div>
</template>

<script>
  import DownloadStep from './DownloadStep'
  import CheckConnection from './substeps/CheckConnection'
  import AuthenticateDevice from './substeps/AuthenticateDevice'
  import CheckLatestSnapshot from './substeps/CheckLatestSnapshot'
  import CompareSnapshots from './substeps/CompareSnapshots'
  import CheckDownloadSize from './substeps/CheckDownloadSize'
  import { BUTTON_STATUS, COMPARE_SNAPSHOTS_RESULTS } from '@/constants'
  const DOWNLOAD_STATUS = {
    CHECKING_CONNECTION: 'Establishing connection with the server...',
    CHECKING_LAST_SNAPSHOT: 'Checking latest available snapshot on the server...'
  }
  export default {
    name: 'download',
    data () {
      return {
        status: DOWNLOAD_STATUS.CHECKING_CONNECTION,
        downloadStep: 1,
        downloadSubStep: 1,
        downloading: false,
        downloadProgress: 0,
        progressMessages: [],
        serverSnapshot: null,
        localDownload: null,
        localUpload: null,
        compareSnapshotsResults: COMPARE_SNAPSHOTS_RESULTS.NONE,
        COMPARE_SNAPSHOTS_RESULTS: COMPARE_SNAPSHOTS_RESULTS,
        autoContinueLabel: '',
        continueStatusArray: [BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED]
      }
    },
    created () {
    },
    props: {
    },
    methods: {
      onContinue: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
        this.downloadStep++
        this.downloadSubStep = 1
      },
      onCancel: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        } else {
          this.$emit('download-cancelled')
          this.downloadStep = 1
          this.downloadSubStep = 1
        }
      },
      checkLatestSnapshotDone: function (serverSnapshot) {
        this.serverSnapshot = serverSnapshot
        this.downloadSubStep = 4
      },
      compareSnapshotsDone: function (autoDownload, warning) {
        if (autoDownload) {
          this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
        } else if (warning) {
          this.continueStatus = BUTTON_STATUS.WARNING
        } else {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
      }
    },
    computed: {
      continueStatus: {
        get: function () {
          return this.continueStatusArray[this.downloadStep - 1]
        },
        set: function (status) {
          this.continueStatusArray.splice(this.downloadStep - 1, 1, status)
        }
      },
      serverSnapshotId: function () {
        console.log('serverSnapshotId', this.serverSnapshot)
        if (this.serverSnapshot === null || (!this.serverSnapshot.hasOwnProperty('id'))) return ''
        return this.serverSnapshot['id']
      }
    },
    components: {
      CompareSnapshots,
      CheckLatestSnapshot,
      CheckConnection,
      AuthenticateDevice,
      DownloadStep,
      CheckDownloadSize
    }
  }
</script>

<style lang="sass" scoped>
</style>
