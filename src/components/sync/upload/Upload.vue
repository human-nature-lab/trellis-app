<template>
  <div class="upload">
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <div>
      <v-stepper v-model="uploadStep">
        <v-stepper-header>
          <v-stepper-step step="1">{{$t('creating')}}</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2">{{$t('uploading')}}</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">{{$t('uploading_images')}}</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <sync-step
              :title="$t('creating')"
              v-if="uploadStep === 1"
              :continue-status="continueStatusArray[0]"
              @continue-clicked="onContinue"
              @cancel-clicked="onCancel">
              <empty-uploads-directory
                v-if="uploadSubStep > 0"
                :logging-service="loggingService"
                @empty-uploads-directory-done="emptyUploadsDirectoryDone"></empty-uploads-directory>
              <create-upload
                v-if="uploadSubStep > 1"
                :logging-service="loggingService"
                @create-upload-done="createUploadDone"></create-upload>
              <compress-upload
                v-if="uploadSubStep > 2"
                :logging-service="loggingService"
                :file-entry="uploadFile"
                @compress-upload-done="compressUploadDone"></compress-upload>
              <calculate-hash
                v-if="uploadSubStep > 3"
                :logging-service="loggingService"
                :file-entry="compressedUploadFile"
                @calculate-hash-done="calculateHashDone"></calculate-hash>
            </sync-step>
          </v-stepper-content>
          <v-stepper-content step="2">
            <sync-step
              :title="$t('uploading')"
              v-if="uploadStep === 2"
              :continue-status="continueStatusArray[1]"
              @continue-clicked="onContinue"
              @cancel-clicked="onCancel">
              <check-connection
                v-if="uploadStep > 1"
                :logging-service="loggingService"
                @connection-ok="uploadSubStep = 2"></check-connection>
              <authenticate-device
                v-if="uploadStep > 1 && uploadSubStep > 1"
                :logging-service="loggingService"
                @authentication-ok="uploadSubStep = 3"></authenticate-device>
              <upload-snapshot
                v-if="uploadStep > 1 && uploadSubStep > 2"
                :logging-service="loggingService"
                :md5hash="compressedUploadFileHash"
                :file-entry="compressedUploadFile"
                @upload-snapshot-done="uploadSnapshotDone">
              </upload-snapshot>
              <verify-upload
                v-if="uploadStep > 1 && uploadSubStep > 3"
                :logging-service="loggingService"
                :md5hash="compressedUploadFileHash"
                :file-entry="compressedUploadFile"
                @verify-upload-done="verifyUploadDone">
              </verify-upload>
              <register-upload
                v-if="uploadStep > 1 && uploadSubStep > 4"
                :logging-service="loggingService"
                :sync="sync"
                @register-upload-done="registerUploadDone">
              </register-upload>
            </sync-step>
          </v-stepper-content>
          <v-stepper-content step="3">
            <sync-step
              :title="$t('uploading_images')"
              v-if="uploadStep === 3"
              :continue-status="continueStatusArray[2]"
              @continue-clicked="onContinue"
              @cancel-clicked="onCancel">
              <request-image-list
                v-if="uploadStep > 2"
                :logging-service="loggingService"
                :updated-photos="updatedPhotos"
                @request-image-list-done="requestImageListDone">
              </request-image-list>
              <find-images
                v-if="uploadStep > 2 && uploadSubStep > 1"
                :logging-service="loggingService"
                :image-list="imageList"
                @find-images-done="findImagesDone">
              </find-images>
              <upload-images
                v-if="uploadStep > 2 && uploadSubStep > 2"
                :logging-service="loggingService"
                :images-to-upload="fileList"
                @upload-images-done="uploadImagesDone">
              </upload-images>
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
  import CheckConnection from '../common/substeps/CheckConnection.vue'
  import AuthenticateDevice from '../common/substeps/AuthenticateDevice.vue'
  import EmptyUploadsDirectory from './substeps/EmptyUploadsDirectory.vue'
  import CreateUpload from './substeps/CreateUpload.vue'
  import CompressUpload from './substeps/CompressUpload.vue'
  import CalculateHash from './substeps/CalculateHash.vue'
  import UploadSnapshot from './substeps/UploadSnapshot.vue'
  import VerifyUpload from './substeps/VerifyUpload.vue'
  import RegisterUpload from './substeps/RegisterUpload.vue'
  import RequestImageList from './substeps/RequestImageList.vue'
  import FindImages from './substeps/FindImages.vue'
  import UploadImages from './substeps/UploadImages.vue'
  import { BUTTON_STATUS } from '../../../static/constants'
  import SyncService from '../../../services/SyncService'
  import DeviceService from '../../../services/device'
  import FileService from '../../../services/file/FileService'
  import Log from '../../../entities/trellis-config/Log'
  import LoggingService, { defaultLoggingService } from '../../../services/logging'

  export default {
    name: 'upload',
    data () {
      return {
        uploadStep: this.initUploadStep,
        uploadSubStep: 0,
        continueStatusArray: [BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED, BUTTON_STATUS.DISABLED],
        sync: undefined,
        currentLog: undefined,
        loggingService: undefined,
        deviceId: '',
        uploadFile: undefined,
        updatedPhotos: [],
        imageList: [],
        fileList: [],
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
      initUploadStep: {
        type: Number,
        required: true
      },
    },
    methods: {
      showLog () {
        return (this.currentLog !== undefined && this.currentLog instanceof Log)
      },
      onContinue () {
        if (this.continueStatus === BUTTON_STATUS.AUTO_CONTINUE) {
          this.continueStatus = BUTTON_STATUS.ENABLED
        }
        if (this.uploadStep < 3) {
          this.uploadStep++
          this.uploadSubStep = 1
        } else {
          this.$emit('upload-done')
        }
      },
      onCancel () {
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
      emptyUploadsDirectoryDone () {
        this.uploadSubStep = 2
      },
      async createUploadDone (fileEntry, updatedPhotos) {
        // At this point updatedPhotos is a list of fileNames and
        // needs to be converted to FileEntries
        for (let i = 0; i < updatedPhotos.length; i++) {
          try {
            let fileEntry = await FileService.getPhoto(updatedPhotos[i])
            this.fileList.push(fileEntry)
          } catch (err) {
            // File not found
          }
        }
        // Convert fileNames into fileEntries
        this.uploadFile = fileEntry
        this.uploadSubStep = 3
      },
      compressUploadDone (fileEntry) {
        this.compressedUploadFile = fileEntry
        this.uploadSubStep = 4
      },
      calculateHashDone (md5hash) {
        this.compressedUploadFileHash = md5hash
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      uploadSnapshotDone () {
        this.uploadSubStep = 4
      },
      verifyUploadDone () {
        this.uploadSubStep = 5
      },
      registerUploadDone () {
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      requestImageListDone (imageList) {
        this.imageList = imageList
        this.uploadSubStep = 2
      },
      findImagesDone (fileList) {
        // Add found images to existing fileList
        this.fileList = this.fileList.concat(fileList)
        this.uploadSubStep = 3
      },
      uploadImagesDone () {
        this.continueStatus = BUTTON_STATUS.DONE
      }
    },
    computed: {
      continueStatus: {
        get () {
          return this.continueStatusArray[this.uploadStep - 1]
        },
        set (status) {
          this.continueStatusArray.splice(this.uploadStep - 1, 1, status)
        }
      }
    },
    components: {
      TrellisAlert,
      SyncStep,
      CheckConnection,
      AuthenticateDevice,
      EmptyUploadsDirectory,
      CreateUpload,
      CompressUpload,
      CalculateHash,
      UploadSnapshot,
      VerifyUpload,
      RegisterUpload,
      RequestImageList,
      FindImages,
      UploadImages
    }
  }
</script>

<style lang="sass" scoped>
</style>
