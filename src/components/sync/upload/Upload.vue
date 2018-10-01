<template>
  <div class="upload">
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <div>
      <v-stepper v-model="uploadStep">
        <v-stepper-header>
          <v-stepper-step step="1">{{$t('creating')}}</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2">{{$t('uploading')}}</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <sync-step
              :title="$t('creating')"
              v-if="uploadStep === 1"
              v-bind:continue-status="continueStatusArray[0]"
              v-on:continue-clicked="onContinue"
              v-on:cancel-clicked="onCancel">
              <empty-uploads-directory
                v-if="uploadSubStep > 0"
                :logging-service="loggingService"
                v-on:empty-uploads-directory-done="emptyUploadsDirectoryDone"></empty-uploads-directory>
              <create-upload
                v-if="uploadSubStep > 1"
                :logging-service="loggingService"
                v-on:create-upload-done="createUploadDone"></create-upload>
              <compress-upload
                v-if="uploadSubStep > 2"
                :logging-service="loggingService"
                :file-entry="uploadFile"
                v-on:compress-upload-done="compressUploadDone"></compress-upload>
              <calculate-hash
                v-if="uploadSubStep > 3"
                :logging-service="loggingService"
                :file-entry="compressedUploadFile"
                v-on:calculate-hash-done="calculateHashDone"></calculate-hash>
            </sync-step>
          </v-stepper-content>
          <v-stepper-content step="2">
            <sync-step
              :title="$t('uploading')"
              v-if="uploadStep === 2"
              v-bind:continue-status="continueStatusArray[1]"
              v-on:continue-clicked="onContinue"
              v-on:cancel-clicked="onCancel">
              <upload-snapshot
                v-if="uploadStep > 1"
                :logging-service="loggingService"
                :md5hash="compressedUploadFileHash"
                :file-entry="compressedUploadFile"
                v-on:upload-snapshot-done="uploadSnapshotDone">
              </upload-snapshot>
              <verify-upload
                v-if="uploadStep > 1 && uploadSubStep > 1"
                :logging-service="loggingService"
                :md5hash="compressedUploadFileHash"
                :file-entry="compressedUploadFile"
                v-on:verify-upload-done="verifyUploadDone">
              </verify-upload>
              <register-upload
                v-if="uploadStep > 1 && uploadSubStep > 2"
                :logging-service="loggingService"
                :sync="sync"
                v-on:register-upload-done="registerUploadDone">
              </register-upload>
            </sync-step>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </div>
  </div>
</template>

<script>
  import TrellisAlert from '../../TrellisAlert.vue'
  import SyncStep from '../SyncStep.vue'
  import EmptyUploadsDirectory from './substeps/EmptyUploadsDirectory.vue'
  import CreateUpload from './substeps/CreateUpload.vue'
  import CompressUpload from './substeps/CompressUpload.vue'
  import CalculateHash from './substeps/CalculateHash.vue'
  import UploadSnapshot from './substeps/UploadSnapshot.vue'
  import VerifyUpload from './substeps/VerifyUpload.vue'
  import RegisterUpload from './substeps/RegisterUpload.vue'
  import { BUTTON_STATUS } from '../../../static/constants'
  import SyncService from '../../../services/SyncService'
  import DeviceService from '../../../services/device/DeviceService'
  import Log from '../../../entities/trellis-config/Log'
  import LoggingService, { defaultLoggingService } from '../../../services/logging/LoggingService'

  export default {
    name: 'upload',
    data () {
      return {
        uploadStep: 1,
        uploadSubStep: 0,
        continueStatusArray: [BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED],
        sync: undefined,
        currentLog: undefined,
        loggingService: undefined,
        deviceId: '',
        uploadFile: undefined,
        compressedUploadFile: undefined,
        compressedUploadFileHash: undefined
      }
    },
    created () {
      DeviceService.getUUID()
        .then((deviceId) => {
          this.deviceId = deviceId
          return SyncService.createSync('upload', deviceId)
        })
        .then((sync) => {
          this.sync = sync
          this.loggingService = new LoggingService({
            'syncId': (sync.id),
            'deviceId': (this.deviceId),
            'component': 'Upload'
          })
        })
        .then(() => { this.uploadSubStep = 1 })
        .catch((err) => {
          defaultLoggingService.log(err)
            .then((log) => { this.currentLog = log })
        })
    },
    props: {
    },
    methods: {
      showLog: function () {
        return (this.currentLog !== undefined && this.currentLog instanceof Log)
      },
      onContinue: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
        if (this.uploadStep < 2) {
          this.uploadStep++
          this.uploadSubStep = 1
        } else {
          this.$emit('upload-done')
        }
      },
      onCancel: function () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        } else {
          if (this.sync !== undefined) {
            SyncService.registerCancelledSync(this.sync)
              .then(() => {
                this.$emit('upload-cancelled')
                this.uploadStep = 1
                this.uploadSubStep = 1
              })
              .catch((err) => {
                this.loggingService.log(err).then((result) => { this.currentLog = result })
              })
          } else {
            this.$emit('upload-cancelled')
            this.uploadStep = 1
            this.uploadSubStep = 1
          }
        }
      },
      emptyUploadsDirectoryDone: function () {
        console.log('emptyUploadsDirectoryDone')
        this.uploadSubStep = 2
      },
      createUploadDone: function (fileEntry) {
        console.log('createUploadDone', fileEntry)
        this.uploadFile = fileEntry
        this.uploadSubStep = 3
      },
      compressUploadDone: function (fileEntry) {
        console.log('compressUploadDone', fileEntry)
        this.compressedUploadFile = fileEntry
        this.uploadSubStep = 4
      },
      calculateHashDone: function (md5hash) {
        console.log('calculateHashDone', md5hash)
        this.compressedUploadFileHash = md5hash
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      uploadSnapshotDone: function () {
        console.log('uploadSnapshotDone')
        this.uploadSubStep = 2
      },
      verifyUploadDone: function () {
        console.log('verifyUploadDone')
        this.uploadSubStep = 3
      },
      registerUploadDone: function () {
        console.log('registerUploadDone')
        this.continueStatus = BUTTON_STATUS.DONE
      }
    },
    computed: {
      continueStatus: {
        get: function () {
          return this.continueStatusArray[this.uploadStep - 1]
        },
        set: function (status) {
          this.continueStatusArray.splice(this.uploadStep - 1, 1, status)
        }
      }
    },
    components: {
      TrellisAlert,
      SyncStep,
      EmptyUploadsDirectory,
      CreateUpload,
      CompressUpload,
      CalculateHash,
      UploadSnapshot,
      VerifyUpload,
      RegisterUpload
    }
  }
</script>

<style lang="sass" scoped>
</style>
