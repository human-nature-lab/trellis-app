<template>
  <div class="upload">
    <trellis-alert v-if="showLog()" :current-log="currentLog"></trellis-alert>
    <div>
      <v-stepper v-model="uploadStep">
        <v-stepper-header>
          <v-stepper-step step="1">Creating</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2">Uploading</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <sync-step
              title="Creating"
              v-if="uploadStep === 1"
              v-bind:continue-status="continueStatusArray[0]"
              v-on:continue-clicked="onContinue"
              v-on:cancel-clicked="onCancel">
              <create-upload
                v-if="uploadSubStep > 0"
                :logging-service="loggingService"
                v-on:create-upload-done="createUploadDone"></create-upload>
            </sync-step>
          </v-stepper-content>
          <v-stepper-content step="2">
            <sync-step
              title="Uploading"
              v-if="uploadStep === 2"
              v-bind:continue-status="continueStatusArray[1]"
              v-on:continue-clicked="onContinue"
              v-on:cancel-clicked="onCancel">
              <upload-snapshot
                v-if="uploadStep > 1"
                :logging-service="loggingService"
                v-on:upload-snapshot-done="uploadSnapshotDone">
              </upload-snapshot>
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
  import CreateUpload from './substeps/CreateUpload.vue'
  import UploadSnapshot from './substeps/UploadSnapshot.vue'
  import { BUTTON_STATUS } from '../../../static/constants'
  import SyncService from '../../../services/sync/SyncService'
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
        deviceId: ''
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
      createUploadDone: function () {
        console.log('createUploadDone')
        this.continueStatus = BUTTON_STATUS.AUTO_CONTINUE
      },
      uploadSnapshotDone: function () {
        console.log('uploadsnapshotDone')
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
      CreateUpload,
      UploadSnapshot
    }
  }
</script>

<style lang="sass" scoped>
</style>
