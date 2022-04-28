<template>
  <div class="download">
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <div class="download-content">
        <v-stepper v-model="downloadStep">
          <v-stepper-header>
            <v-stepper-step step="1">{{ $t('connecting') }}</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="2">{{ $t('downloading') }}</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">{{ $t('replacing') }}</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="4">{{ $t('images') }}</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <sync-step
                :title="$t('connecting')"
                v-if="downloadStep === 1"
                :continue-status="continueStatusArray[0]"
                @continue-clicked="onContinue"
                @cancel-clicked="onCancel">
                <check-connection
                  v-if="downloadSubStep > 0"
                  :logging-service="loggingService"
                  @connection-ok="downloadSubStep = 2"></check-connection>
                <authenticate-device
                  v-if="downloadSubStep > 1"
                  :logging-service="loggingService"
                  @authentication-ok="downloadSubStep = 3"></authenticate-device>
                <check-latest-snapshot
                  v-if="downloadSubStep > 2"
                  :logging-service="loggingService"
                  @check-latest-snapshot-done="checkLatestSnapshotDone"></check-latest-snapshot>
                <compare-download
                  v-if="downloadSubStep > 3"
                  :logging-service="loggingService"
                  :server-snapshot="serverSnapshot"
                  @compare-download-done="compareDownloadDone"></compare-download>
                <compare-upload
                  v-if="downloadSubStep > 4"
                  :logging-service="loggingService"
                  :server-snapshot="serverSnapshot"
                  @compare-upload-done="compareUploadDone"></compare-upload>
              </sync-step>
            </v-stepper-content>
            <v-stepper-content step="2">
              <sync-step
                :title="$t('downloading')"
                v-if="downloadStep === 2"
                :continue-status="continueStatusArray[1]"
                @continue-clicked="onContinue"
                @cancel-clicked="onCancel">
                <empty-snapshots-directory
                  v-if="downloadStep > 1"
                  :logging-service="loggingService"
                  :snapshotId="serverSnapshotId"
                  @empty-snapshots-directory-done="emptySnapshotsDirectoryDone">
                </empty-snapshots-directory>
                <check-download-size
                  v-if="downloadStep > 1 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  :snapshotId="serverSnapshotId"
                  @check-download-size-done="checkDownloadSizeDone">
                </check-download-size>
                <download-snapshot
                  v-if="downloadStep > 1 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  :snapshotId="serverSnapshotId"
                  :snapshotFileSize="snapshotFileSize"
                  @download-snapshot-done="downloadSnapshotDone">
                </download-snapshot>
                <verify-download
                  v-if="downloadStep > 1 && downloadSubStep > 3"
                  :logging-service="loggingService"
                  :fileEntry="downloadedSnapshotFileEntry"
                  :fileHash="serverSnapshot.hash"
                  @verify-download-done="verifyDownloadDone">
                </verify-download>
                <extract-snapshot
                  v-if="downloadStep > 1 && downloadSubStep > 4"
                  :logging-service="loggingService"
                  :fileEntry="downloadedSnapshotFileEntry"
                  @extract-snapshot-done="extractSnapshotDone">
                </extract-snapshot>
              </sync-step>
            </v-stepper-content>
            <v-stepper-content step="3">
              <sync-step
                :title="$t('replacing')"
                v-if="downloadStep === 3"
                :continue-status="continueStatusArray[2]"
                @continue-clicked="onContinue"
                @cancel-clicked="onCancel">
                <close-database
                  v-if="downloadStep > 2"
                  :loggingService="loggingService"
                  @done="onClosed" />
                <remove-database
                  v-if="downloadStep > 2 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  @remove-database-done="removeDatabaseDone">
                </remove-database>
                <move-database
                  v-if="downloadStep > 2 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  @done="movedDatabase" />
                <configure-database
                  v-if="downloadStep > 2 && downloadSubStep > 3"
                  :logging-service="loggingService"
                  :query-runner="queryRunner"
                  @configure-database-done="configureDatabaseDone">
                </configure-database>
                <register-download
                  v-if="downloadStep > 2 && downloadSubStep > 4"
                  :logging-service="loggingService"
                  :sync="sync"
                  @register-download-done="registerDownloadDone">
                </register-download>
              </sync-step>
            </v-stepper-content>
            <v-stepper-content step="4">
              <sync-step
                :title="$t('images')"
                v-if="downloadStep === 4"
                :continue-status="continueStatusArray[3]"
                @continue-clicked="onContinue"
                @cancel-clicked="onCancel">
                <check-connection
                  v-if="downloadStep > 3"
                  :logging-service="loggingService"
                  @connection-ok="downloadSubStep = 2"></check-connection>
                <authenticate-device
                  v-if="downloadStep > 3 && downloadSubStep > 1"
                  :logging-service="loggingService"
                  @authentication-ok="downloadSubStep = 3"></authenticate-device>
                <generate-image-list
                  v-if="downloadStep > 3 && downloadSubStep > 2"
                  :logging-service="loggingService"
                  @generate-image-list-done="generateImageListDone">
                </generate-image-list>
                <calculate-image-size
                  :images-to-download="imagesToDownload"
                  v-if="downloadStep > 3 && downloadSubStep > 3"
                  :logging-service="loggingService"
                  @calculate-image-size-done="calculateImageSizeDone">
                </calculate-image-size>
                <download-images
                  :images-to-download="imagesToDownload"
                  :num-images-found="numImagesFound"
                  v-if="downloadStep > 3 && downloadSubStep > 4"
                  :logging-service="loggingService"
                  @download-images-done="downloadImagesDone">
                </download-images>
              </sync-step>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import SyncStep from '../SyncStep.vue'
  import CheckConnection from '../common/substeps/CheckConnection.vue'
  import AuthenticateDevice from '../common/substeps/AuthenticateDevice.vue'
  import CheckLatestSnapshot from './substeps/CheckLatestSnapshot.vue'
  import CompareDownload from './substeps/CompareDownload.vue'
  import CompareUpload from './substeps/CompareUpload.vue'
  import EmptySnapshotsDirectory from './substeps/EmptySnapshotsDirectory.vue'
  import CheckDownloadSize from './substeps/CheckDownloadSize.vue'
  import DownloadSnapshot from './substeps/DownloadSnapshot.vue'
  import VerifyDownload from './substeps/VerifyDownload.vue'
  import ExtractSnapshot from './substeps/ExtractSnapshot.vue'
  import RemoveDatabase from './substeps/RemoveDatabase.vue'
  import ConfigureDatabase from './substeps/ConfigureDatabase.vue'
  import RegisterDownload from './substeps/RegisterDownload.vue'
  import GenerateImageList from './substeps/GenerateImageList.vue'
  import CalculateImageSize from './substeps/CalculateImageSize.vue'
  import MoveDatabase from './substeps/MoveDatabase.vue'
  import CloseDatabase from './substeps/CloseDatabase.vue'
  import DownloadImages from './substeps/DownloadImages.vue'
  import { BUTTON_STATUS, COMPARE_UPLOAD_RESULTS, COMPARE_DOWNLOAD_RESULTS } from '../../../static/constants'
  import SyncService from '../../../services/SyncService'
  import DeviceService from '../../../services/device'
  import DatabaseService from '../../../services/database'
  import Log from '../../../entities/trellis-config/Log'
  import Sync from '../../../entities/trellis-config/Sync'
  import LoggingService, { defaultLoggingService } from '../../../services/logging'
  import TrellisAlert from '../../TrellisAlert.vue'
  export default Vue.extend({
    name: 'download',
    data () {
      return {
        status: this.$t('checking_connection'),
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
    async created () {
      try {
        this.deviceId = await DeviceService.getUUID()
        this.sync = await SyncService.createSync('download', this.deviceId)
        this.loggingService = new LoggingService({
          syncId: this.sync.id,
          deviceId: this.deviceId,
          component: 'Download'
        })
        this.downloadSubStep = 1
      } catch (err) {
        this.currentLog = await defaultLoggingService.log(err)
      }
    },
    props: {
      initDownloadStep: {
        type: Number,
        required: true
      }
    },
    methods: {
      showLog () {
        return (this.currentLog !== undefined && this.currentLog instanceof Log)
      },
      onContinue () {
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
      onCancel () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        } else {
          // Cancelling from the download images step should still register a successful sync
          if (this.sync !== undefined && this.downloadStep < 4) {
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
      checkLatestSnapshotDone: async function (serverSnapshot) {
        this.serverSnapshot = serverSnapshot
        const connection = await DatabaseService.getConfigDatabase()
        const repository = await connection.getRepository(Sync)
        await repository.update({id: this.sync.id}, {
          snapshotCreatedAt: this.serverSnapshot['created_at'] + 'Z',
          snapshotId: this.serverSnapshot['id']
        })
        this.downloadSubStep = 4
      },
      compareDownloadDone (result) {
        this.compareDownloadResult = result
        this.downloadSubStep = 5
      },
      compareUploadDone (result) {
        this.compareUploadResult = result
        if ((this.compareDownloadResult === COMPARE_DOWNLOAD_RESULTS.NO_DOWNLOAD ||
             this.compareDownloadResult === COMPARE_DOWNLOAD_RESULTS.DOWNLOAD_OLDER) &&
            (this.compareUploadResult === COMPARE_UPLOAD_RESULTS.NONE_PENDING)) {
          this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
        } else {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
      },
      emptySnapshotsDirectoryDone () {
        this.downloadSubStep = 2
      },
      checkDownloadSizeDone (snapshotFileSize) {
        this.snapshotFileSize = snapshotFileSize
        this.downloadSubStep = 3
      },
      downloadSnapshotDone (fileEntry) {
        this.downloadedSnapshotFileEntry = fileEntry
        this.downloadSubStep = 4
      },
      verifyDownloadDone () {
        this.downloadSubStep = 5
      },
      extractSnapshotDone (extractedSnapshot) {
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
        this.extractedSnapshot = extractedSnapshot
      },
      removeDatabaseDone (queryRunner) {
        this.queryRunner = queryRunner
        this.downloadSubStep++
      },
      insertRowsDone (queryRunner) {
        this.queryRunner = queryRunner
        this.downloadSubStep = 3
      },
      configureDatabaseDone (queryRunner) {
        this.queryRunner = queryRunner
        this.downloadSubStep++
      },
      checkForeignKeysDone () {
        this.downloadSubStep = 5
      },
      registerDownloadDone () {
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      generateImageListDone (imageList) {
        this.imagesToDownload = imageList
        this.downloadSubStep = 4
      },
      calculateImageSizeDone (photosFound) {
        this.numImagesFound = photosFound
        this.downloadSubStep = 5
      },
      movedDatabase () {
        this.downloadSubStep++
      },
      onClosed () {
        this.downloadSubStep++
      },
      downloadImagesDone (imagesDownloaded) {
        this.continueStatus = BUTTON_STATUS.DONE
      }
    },
    computed: {
      continueStatus: {
        get () {
          return this.continueStatusArray[this.downloadStep - 1]
        },
        set (status) {
          this.continueStatusArray.splice(this.downloadStep - 1, 1, status)
        }
      },
      serverSnapshotId () {
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
      SyncStep,
      EmptySnapshotsDirectory,
      CheckDownloadSize,
      DownloadSnapshot,
      ExtractSnapshot,
      VerifyDownload,
      RemoveDatabase,
      ConfigureDatabase,
      RegisterDownload,
      GenerateImageList,
      CalculateImageSize,
      DownloadImages,
      MoveDatabase,
      CloseDatabase
    }
  })
</script>

<style lang="sass" scoped>
</style>
