<template>
  <div class="download">
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <div class="download-content">
        <v-stepper v-model="downloadStep">
          <v-stepper-header>
            <v-stepper-step step="1">Connecting</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2">Downloading</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Inserting</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">Images</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <download-step
                title="Connecting"
                v-if="downloadStep === 1"
                v-bind:continue-status="continueStatusArray[0]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <check-connection
                  v-if="downloadSubStep > 0"
                  :logging-service="loggingService"
                  v-on:connection-ok="downloadSubStep = 2"></check-connection>
                <authenticate-device
                  v-if="downloadSubStep > 1"
                  :logging-service="loggingService"
                  v-on:authentication-ok="downloadSubStep = 3"></authenticate-device>
                <check-latest-snapshot
                  v-if="downloadSubStep > 2"
                  :logging-service="loggingService"
                  v-on:check-latest-snapshot-done="checkLatestSnapshotDone"></check-latest-snapshot>
                <compare-download
                  v-if="downloadSubStep > 3"
                  :logging-service="loggingService"
                  v-bind:server-snapshot="serverSnapshot"
                  v-on:compare-download-done="compareDownloadDone"></compare-download>
                <compare-upload
                  v-if="downloadSubStep > 4"
                  :logging-service="loggingService"
                  v-bind:server-snapshot="serverSnapshot"
                  v-on:compare-upload-done="compareUploadDone"></compare-upload>
              </download-step>
            </v-stepper-content>
            <v-stepper-content step="2">
              <download-step
                title="Downloading"
                v-if="downloadStep === 2"
                v-bind:continue-status="continueStatusArray[1]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <empty-snapshots-directory
                  v-if="downloadStep > 1"
                  :logging-service="loggingService"
                  v-bind:snapshotId="serverSnapshotId"
                  v-on:empty-snapshots-directory-done="emptySnapshotsDirectoryDone">
                </empty-snapshots-directory>
                <check-download-size
                  v-if="downloadStep > 1 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  v-bind:snapshotId="serverSnapshotId"
                  v-on:check-download-size-done="checkDownloadSizeDone">
                </check-download-size>
                <download-snapshot
                  v-if="downloadStep > 1 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  v-bind:snapshotId="serverSnapshotId"
                  v-bind:snapshotFileSize="snapshotFileSize"
                  v-on:download-snapshot-done="downloadSnapshotDone">
                </download-snapshot>
                <verify-download
                  v-if="downloadStep > 1 && downloadSubStep > 3"
                  :logging-service="loggingService"
                  v-bind:fileEntry="downloadedSnapshotFileEntry"
                  v-bind:fileHash="serverSnapshot.hash"
                  v-on:verify-download-done="verifyDownloadDone">
                </verify-download>
                <extract-snapshot
                  v-if="downloadStep > 1 && downloadSubStep > 4"
                  :logging-service="loggingService"
                  v-bind:fileEntry="downloadedSnapshotFileEntry"
                  v-on:extract-snapshot-done="extractSnapshotDone">
                </extract-snapshot>
              </download-step>
            </v-stepper-content>
            <v-stepper-content step="3">
              <download-step
                title="Inserting"
                v-if="downloadStep === 3"
                v-bind:continue-status="continueStatusArray[2]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <remove-database
                  v-if="downloadStep > 2"
                  :logging-service="loggingService"
                  v-on:remove-database-done="removeDatabaseDone">
                </remove-database>
                <insert-rows
                  v-if="downloadStep > 2 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  :query-runner="queryRunner"
                  v-on:insert-rows-done="insertRowsDone"
                  v-bind:extracted-snapshot="extractedSnapshot">
                </insert-rows>
                <check-foreign-keys
                  v-if="downloadStep > 2 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  :query-runner="queryRunner"
                  v-on:check-foreign-keys-done="checkForeignKeysDone">
                </check-foreign-keys>
                <register-download
                  v-if="downloadStep > 2 && downloadSubStep > 3"
                  :logging-service="loggingService"
                  :sync="sync"
                  v-on:register-download-done="registerDownloadDone">
                </register-download>
              </download-step>
            </v-stepper-content>
            <v-stepper-content step="4">
              <download-step
                title="Downloading images"
                v-if="downloadStep === 4"
                v-bind:continue-status="continueStatusArray[3]"
                v-on:continue-clicked="onContinue"
                v-on:cancel-clicked="onCancel">
                <generate-image-list
                  v-if="downloadStep > 3"
                  :logging-service="loggingService"
                  v-on:generate-image-list-done="generateImageListDone">
                </generate-image-list>
                <calculate-image-size
                  v-bind:images-to-download="imagesToDownload"
                  v-if="downloadStep > 3 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  v-on:calculate-image-size-done="calculateImageSizeDone">
                </calculate-image-size>
                <download-images
                  v-bind:images-to-download="imagesToDownload"
                  v-bind:num-images-found="numImagesFound"
                  v-if="downloadStep > 3 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  v-on:download-images-done="downloadImagesDone">
                </download-images>
              </download-step>
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
  import CompareDownload from './substeps/CompareDownload'
  import CompareUpload from './substeps/CompareUpload'
  import EmptySnapshotsDirectory from './substeps/EmptySnapshotsDirectory'
  import CheckDownloadSize from './substeps/CheckDownloadSize'
  import DownloadSnapshot from './substeps/DownloadSnapshot.vue'
  import VerifyDownload from './substeps/VerifyDownload.vue'
  import ExtractSnapshot from './substeps/ExtractSnapshot.vue'
  import RemoveDatabase from './substeps/RemoveDatabase.vue'
  import InsertRows from './substeps/InsertRows.vue'
  import CheckForeignKeys from './substeps/CheckForeignKeys.vue'
  import RegisterDownload from './substeps/RegisterDownload.vue'
  import GenerateImageList from './substeps/GenerateImageList.vue'
  import CalculateImageSize from './substeps/CalculateImageSize.vue'
  import DownloadImages from './substeps/DownloadImages.vue'
  import { BUTTON_STATUS, COMPARE_UPLOAD_RESULTS, COMPARE_DOWNLOAD_RESULTS } from '../../../static/constants'
  import SyncService from '../../../services/sync/SyncService'
  import DeviceService from '../../../services/device/DeviceService'
  import Log from '../../../entities/trellis-config/Log'
  import LoggingService, { defaultLoggingService } from '../../../services/logging/LoggingService'
  import TrellisAlert from '../../TrellisAlert.vue'
  const DOWNLOAD_STATUS = {
    CHECKING_CONNECTION: 'Establishing connection with the server...',
    CHECKING_LAST_SNAPSHOT: 'Checking latest available snapshot on the server...'
  }
  export default {
    name: 'download',
    data () {
      return {
        status: DOWNLOAD_STATUS.CHECKING_CONNECTION,
        downloadStep: this.initDownloadStep,
        downloadSubStep: 0,
        snapshotFileSize: null,
        serverSnapshot: null,
        localDownload: null,
        localUpload: null,
        compareDownloadResult: COMPARE_DOWNLOAD_RESULTS.NONE,
        compareUploadResult: COMPARE_UPLOAD_RESULTS.NONE,
        COMPARE_DOWNLOAD_RESULTS: COMPARE_DOWNLOAD_RESULTS,
        COMPARE_UPLOAD_RESULTS: COMPARE_UPLOAD_RESULTS,
        continueStatusArray: [BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED],
        downloadedSnapshotFileEntry: null,
        extractedSnapshot: null,
        imagesToDownload: {},
        numImagesFound: 0,
        sync: undefined,
        currentLog: undefined,
        loggingService: undefined,
        deviceId: '',
        queryRunner: undefined
      }
    },
    created () {
      DeviceService.getUUID()
        .then((deviceId) => {
          this.deviceId = deviceId
          return SyncService.createSync('download', deviceId)
        })
        .then((sync) => {
          this.sync = sync
          this.loggingService = new LoggingService({
            'syncId': (sync.id),
            'deviceId': (this.deviceId),
            'component': 'Download'
          })
        })
        .then(() => { this.downloadSubStep = 1 })
        .catch((err) => {
          defaultLoggingService.log(err)
            .then((log) => { this.currentLog = log })
        })
    },
    props: {
      initDownloadStep: {
        type: Number,
        required: true
      }
    },
    methods: {
      showLog: function () {
        return (this.currentLog !== undefined && this.currentLog instanceof Log)
      },
      onContinue: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
        if (this.downloadStep < 4) {
          this.downloadStep++
          this.downloadSubStep = 1
        } else {
          this.$emit('download-done')
        }
      },
      onCancel: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        } else {
          if (this.sync !== undefined) {
            SyncService.registerCancelledSync(this.sync)
              .then(() => {
                this.$emit('download-cancelled')
                this.downloadStep = this.initDownloadStep
                this.downloadSubStep = 1
              })
              .catch((err) => {
                this.loggingService.log(err).then((result) => { this.currentLog = result })
              })
          } else {
            this.$emit('download-cancelled')
            this.downloadStep = this.initDownloadStep
            this.downloadSubStep = 1
          }
        }
      },
      checkLatestSnapshotDone: function (serverSnapshot) {
        this.serverSnapshot = serverSnapshot
        this.downloadSubStep = 4
      },
      compareDownloadDone: function (result) {
        console.log('compareDownloadDone', result)
        this.compareDownloadResult = result
        this.downloadSubStep = 5
      },
      compareUploadDone: function (result) {
        console.log('compareUploadDone', result)
        this.compareUploadResult = result
        if ((this.compareDownloadResult === COMPARE_DOWNLOAD_RESULTS.NO_DOWNLOAD ||
             this.compareDownloadResult === COMPARE_DOWNLOAD_RESULTS.DOWNLOAD_OLDER) &&
            (this.compareUploadResult === COMPARE_UPLOAD_RESULTS.NO_UPLOAD ||
             this.compareUploadResult === COMPARE_UPLOAD_RESULTS.UPLOAD_OLDER)) {
          this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
        } else {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
      },
      emptySnapshotsDirectoryDone: function () {
        this.downloadSubStep = 2
      },
      checkDownloadSizeDone: function (snapshotFileSize) {
        this.snapshotFileSize = snapshotFileSize
        this.downloadSubStep = 3
      },
      downloadSnapshotDone: function (fileEntry) {
        this.downloadedSnapshotFileEntry = fileEntry
        this.downloadSubStep = 4
      },
      verifyDownloadDone: function () {
        this.downloadSubStep = 5
      },
      extractSnapshotDone: function (extractedSnapshot) {
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
        this.extractedSnapshot = extractedSnapshot
      },
      removeDatabaseDone: function (queryRunner) {
        this.queryRunner = queryRunner
        this.downloadSubStep = 2
      },
      insertRowsDone: function (queryRunner) {
        this.queryRunner = queryRunner
        this.downloadSubStep = 3
      },
      checkForeignKeysDone: function () {
        this.downloadSubStep = 4
      },
      registerDownloadDone: function () {
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      generateImageListDone: function (imageList) {
        this.imagesToDownload = imageList
        this.downloadSubStep = 2
      },
      calculateImageSizeDone: function (photosFound) {
        this.numImagesFound = photosFound
        this.downloadSubStep = 3
      },
      downloadImagesDone: function (imagesDownloaded) {
        this.continueStatus = BUTTON_STATUS.DONE
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
        if (this.serverSnapshot === null || (!this.serverSnapshot.hasOwnProperty('id'))) return ''
        return this.serverSnapshot['id']
      }
    },
    components: {
      TrellisAlert,
      CompareDownload,
      CompareUpload,
      CheckLatestSnapshot,
      CheckConnection,
      AuthenticateDevice,
      DownloadStep,
      EmptySnapshotsDirectory,
      CheckDownloadSize,
      DownloadSnapshot,
      ExtractSnapshot,
      VerifyDownload,
      RemoveDatabase,
      InsertRows,
      CheckForeignKeys,
      RegisterDownload,
      GenerateImageList,
      CalculateImageSize,
      DownloadImages
    }
  }
</script>

<style lang="sass" scoped>
</style>
