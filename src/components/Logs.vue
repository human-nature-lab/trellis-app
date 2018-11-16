<template>
  <v-container fluid>
    <v-toolbar flat>
      <v-toolbar-title>{{$t('logs')}}</v-toolbar-title>
      <v-spacer />
      <v-menu offset-y v-if="isCordova">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="uploadLogs">
            <v-list-tile-action>
              <v-icon>cloud_upload</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              Upload logs
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="deleteLogs">
            <v-list-tile-action>
              <v-icon>delete</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              Delete logs
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-data-table
      :loading="isLoading"
      :headers="headers"
      :items="logs"
      :total-items="total"
      :pagination.sync="pagination"
      @update:pagination="updatePage">
      <template slot="items" slot-scope="props" >
        <tr @click="showFull(props.item)">
          <td>
            {{props.item.createdAt.local().fromNow()}}
          </td>
          <td>
            {{props.item.message}}
          </td>
          <td>
            {{props.item.component}}
          </td>
          <td>
            <v-icon v-if="props.item.uploadedAt" color="green">check</v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog
      v-if="isFullOpen"
      v-model="isFullOpen">
      <ModalTitle :title="`${fullLog.severity}: ${fullLog.createdAt}`" @close="isFullOpen = false"/>
      <v-card flat>
        <v-container
          fluid
          color="white">
          <v-layout column>
            <v-flex
              v-for="prop in ['message', 'fullMessage', 'component', 'syncId', 'interviewId', 'deviceId', 'userId', 'version', 'offline', 'uploadedAt']">
              <v-layout>
                <v-flex class="subheader">{{prop}}</v-flex>
                <v-flex>{{fullLog[prop]}}</v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog v-model="upload.isOpen" :persistent="upload.isActive">
      <v-card>
        <v-container>
          <v-layout>
            {{upload.message}} {{upload.numUploaded}} / {{upload.numToUpload}}
          </v-layout>
          <v-progress-linear
            :query="upload.numUploaded > 0"
            :value="100 * upload.numUploaded / upload.numToUpload" />
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteM.isOpen" :persistent="!deleteM.canExit">
      <ModalTitle title="Delete logs" @close="deleteM.isOpen = false" />
      <v-card>
        <v-container>
          <v-layout>{{deleteM.message}}</v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import {defaultLoggingService} from "../services/logging/LoggingService"
  import Log from "../entities/trellis-config/Log"
  import ModalTitle from './ModalTitle'
  import uploadLogs from "../services/logging/UploadLogs"
  import DeleteLogs from "../services/logging/DeleteLogs"

  export default Vue.extend({
    name: 'Logs',
    components: { ModalTitle },
    data () {
      return {
        headers: [{
          text: 'Timestamp',
          value: 'createdAt'
        }, {
          text: 'Message',
          value: 'message'
        }, {
          text: 'Component',
          value: 'component'
        }, {
          text: 'Uploaded',
          value: 'uploadedAt'
        }],
        pagination: {
          descending: true,
          page: 1,
          rowsPerPage: 100,
          sortBy: 'createdAt'
        },
        total: 10,
        isLoading: false,
        isFullOpen: false,
        upload: {
          message: '',
          isOpen: false,
          isLocked: true,
          isActive: false,
          hasConnected: false,
          numToUpload: 0,
          numUploaded: 0
        },
        deleteM: {
          isOpen: false,
          canExit: false,
          message: ''
        },
        error: null,
        fullLog: null,
        logs: []
      }
    },
    mounted () {
      this.updateTotal()
    },
    methods: {
      showFull (log: Log) {
        this.isFullOpen = true
        this.fullLog = log
      },
      async updateTotal () {
        this.total = await defaultLoggingService.getLogCount()
      },
      updatePage (pagination) {
        this.pagination = pagination
        this.loadPage()
      },
      async loadPage () {
        this.isLoading = true
        this.logs = await defaultLoggingService.getLogPage(this.pagination.page - 1, this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending)
        this.isLoading = false
      },
      async uploadLogs () {
        try {
          this.upload.message = 'Uploading...'
          this.upload.isActive = true
          this.upload.isOpen = true
          this.upload.hasConnected = false
          await uploadLogs({
            progress: (completed: number, total: number) => {
              this.upload.numUploaded = completed
              this.upload.numToUpload = total
              if (completed > 0) {
                this.upload.hasConnected = true
              }
            }
          })
          this.loadPage()
          this.upload.message = 'Done uploading logs!'
        } catch (err) {
          err.component = 'Logs'
          defaultLoggingService.log(err)
          this.upload.message = err
        } finally {
          this.upload.isActive = false
        }
      },
      async deleteLogs () {
        if (confirm('Are you sure you would like to delete the logs?')) {
          try {
            this.deleteM.isOpen = true
            this.deleteM.canExit = false
            this.deleteM.message = 'Deleting'
            await DeleteLogs()
            this.deleteM.message = 'Logs have been deleted'
          } catch (err) {
            this.log(err)
          } finally {
            this.deleteM.canExit = true
            this.loadPage()
          }
        }
      }
    }
  })
</script>

<style scoped>

</style>
