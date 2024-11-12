<template>
  <v-container fluid>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('logs') }}</v-toolbar-title>
      <v-spacer />
      <v-menu offset-y v-if="isCordova">
        <template #activator="{ on, attrs }">
          <v-btn
            v-on="on"
            v-bind="attrs"
            icon
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="uploadLogs">
            <v-list-item-action>
              <v-icon>mdi-cloud-upload</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              Upload logs
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="deleteLogs">
            <v-list-item-action>
              <v-icon>mdi-delete</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              Delete logs
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-data-table
      :loading="isLoading"
      :headers="headers"
      :items="logs"
      :server-items-length="total"
      :items-per-page.sync="pagination.itemsPerPage"
      @pagination="updatePage"
      :page.sync="pagination.page"
    >
      <template #item="{ item }">
        <tr @click="showFull(item)">
          <td>
            {{ item.createdAt | relativeTime }}
          </td>
          <td :class="`text--${item.severity} ${item.severity}`">
            {{ item.severity }}
          </td>
          <td>
            {{ item.message }}
          </td>
          <td>
            {{ item.component }}
          </td>
          <td>
            <v-icon v-if="item.uploadedAt" color="green">mdi-check</v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
    <TrellisModal
      v-model="isFullOpen"
      :title="fullLog ? `${fullLog.severity}: ${fullLog.createdAt}` : ''"
    >
      <v-container
        v-if="isFullOpen"
        fluid
        color="white"
      >
        <v-col>
          <v-col
            v-for="prop in ['message', 'fullMessage', 'component', 'syncId', 'interviewId', 'deviceId', 'userId', 'version', 'offline', 'uploadedAt']"
            :key="prop"
          >
            <v-row>
              <v-col class="text-h6">
                {{ prop }}
              </v-col>
              <v-col>{{ fullLog[prop] }}</v-col>
            </v-row>
          </v-col>
        </v-col>
      </v-container>
    </TrellisModal>
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
  import DocsLinkMixin from '@/mixins/DocsLinkMixin'
  import { defaultLoggingService } from '@/services/logging'
  import Log from '@/entities/trellis-config/Log'
  import TrellisModal from '@/components/TrellisModal.vue'
  import ModalTitle from '@/components/ModalTitle.vue'
  import uploadLogs from '@/services/upload/UploadLogs'
  import DeleteLogs from '@/services/upload/DeleteLogs'
import { relativeTime } from '@/filters/date'

  export default Vue.extend({
    name: 'Logs',
    components: { TrellisModal, ModalTitle },
    filters: { relativeTime },
    mixins: [DocsLinkMixin('./admin/Logs.md')],
    data () {
      return {
        headers: [{
          text: 'Timestamp',
          value: 'createdAt'
        }, {
          text: 'Severity',
          value: 'severity'
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
          itemsPerPage: 10,
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
      this.loadPage()
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
        console.log('pagination', pagination)
        this.pagination = pagination
        this.loadPage()
      },
      async loadPage () {
        this.isLoading = true
        this.logs = await defaultLoggingService.getLogPage(this.pagination.page - 1, this.pagination.itemsPerPage, this.pagination.sortBy, this.pagination.descending)
        this.isLoading = false
        console.log('logs', this.logs)
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
