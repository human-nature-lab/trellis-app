<template>
  <v-container>
    <v-col>
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">
            {{ $t('snapshots') }}
          </h3>
          <v-spacer />
          <v-btn
            text
            :loading="generatingSnapshot"
            :disabled="generatingSnapshot"
            @click="generateSnapshot(false)">
            {{ $t('generate_snapshot') }}
          </v-btn>
          <v-btn icon @click="getSnapshots" :disabled="snapshotsLoading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-menu offset-y left>
            <template #activator="{ on, attrs }">
              <v-btn icon v-on="on" v-bind="attrs">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="generateSnapshot(true)">
                {{ $t('force_generate_snapshot') }}
              </v-list-item>
              <v-list-item @click="generateSnapshot(true, true)">
                {{ $t('generate_full_snapshot') }}
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>
        <v-card-text>
          <v-data-table
            sort-by="created_at"
            sort-desc
            :items-per-page="5"
            :loading="snapshotsLoading"
            :headers="snapshotColumns"
            :items="snapshots">
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.created_at }}</td>
                <td>{{ item.file_name }}</td>
              </tr>
            </template>
            <template v-slot:no-data>
              <v-alert :value="!snapshotsLoading" type="info">
                {{ $t('no_results') }}
              </v-alert>
              <span v-if="snapshotsLoading">
                {{ $t('loading') }}
              </span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">
            {{ $t('uploads') }}
          </h3>
          <v-spacer />
          <v-btn
            text
            :loading="uploadsProcessing"
            :disabled="uploadsProcessing"
            @click="processUploads">
            {{ $t('process_uploads') }}
          </v-btn>
          <v-btn icon @click="getUploads" :disabled="uploadsLoading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row no-gutters class="mb-3">
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              type="search"
              :label="$t('search')"
              single-line
              hide-details />
            <v-spacer />
          </v-row>
          <v-data-table
            sort-by="created_at"
            sort-desc
            show-select
            show-expand
            single-expand
            :items-per-page="5"
            v-model="selectedUploads"
            :loading="uploadsLoading"
            :headers="uploadColumns"
            :items="uploadsFiltered">
            <template v-slot:expanded-item="{ item }">
              <UploadError
                v-if="item.status === 'FAILED' || item.status === 'ERROR'"
                :error="item"
                colspan="8" />
              <UploadLogs
                v-else-if="item.status === 'SUCCESS'"
                :upload="item"
                :isOpen="true"
                colspan="8" />
              <td v-else colspan="8">
                Please process this upload to view more information about it.
              </td>
            </template>
            <template slot="no-data">
              <v-alert :value="!uploadsLoading" type="info">
                {{ $t('no_results') }}
              </v-alert>
              <span v-if="uploadsLoading">
                {{ $t('loading') }}
              </span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-container>
</template>

<script>
  import SyncAdminService from '@/services/SyncAdminService'
  import UploadLogs from '@/components/sync/admin/UploadLogs.vue'
  import UploadError from '@/components/sync/admin/UploadError.vue'
  import DocsLinkMixin from '@/mixins/DocsLinkMixin'
  import DocsFiles from '@/components/documentation/DocsFiles'
  import { updateTitle } from '@/router/history'

  export default {
    name: 'sync-admin',
    mixins: [DocsLinkMixin(DocsFiles.sync.admin)],
    components: { UploadLogs, UploadError },
    data () {
      return {
        generatingSnapshot: false,
        search: '',
        snapshotsLoading: false,
        snapshots: [],
        selectedUploads: [],
        snapshotColumns: [
          {
            text: 'Created on',
            value: 'created_at'
          },
          {
            text: 'File name',
            value: 'file_name'
          }
        ],
        uploadsProcessing: false,
        uploadsLoading: false,
        uploads: [],
        uploadColumns: [{
          text: '',
          sortable: false
        }, {
          text: 'Created on',
          value: 'created_at'
        }, {
          text: 'Status',
          value: 'status'
        }, {
          text: 'Device name',
          value: 'device_name'
        }, {
          text: 'Device id',
          value: 'device_id'
        }, {
          text: 'File name',
          value: 'file_name'
        }]
      }
    },
    setup () {
      updateTitle({ key: 'sync_admin' })
    },
    created () {
      this.getUploads()
      this.getSnapshots()
    },
    props: {
    },
    computed: {
      uploadsFiltered: function () {
        let returnArray = this.uploads
        if (this.search && this.search.length > 0) {
          returnArray = this.uploads.filter(u => {
            return ((!u.device_name) || u.device_name.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
          })
        }
        return returnArray
      }
    },
    methods: {
      getUploads: async function () {
        this.uploadsLoading = true
        this.selectedUploads = []
        try {
          const uploads = await SyncAdminService.listUploads()
          this.uploads = uploads.map(u => {
            u.isOpen = false
            return u
          })
        } catch (err) {
          this.handleError(err, 'Unable to fetch uploads')
        } finally {
          this.uploadsLoading = false
        }
      },
      getSnapshots: async function () {
        this.snapshotsLoading = true
        try {
          this.snapshots = await SyncAdminService.listSnapshots()
        } catch (err) {
          this.handleError(err, 'Unable to fetch snapshots')
        } finally {
          this.snapshotsLoading = false
        }
      },
      processUploads: async function () {
        this.uploadsProcessing = true
        try {
          await SyncAdminService.processUploads(this.selectedUploads.map(u => u.id))
          this.getUploads()
        } catch (err) {
          this.handleError(err, 'Unable to process uploads')
        } finally {
          this.uploadsProcessing = false
        }
      },
      generateSnapshot: async function (force = false, complete = false) {
        this.generatingSnapshot = true
        try {
          const res = await SyncAdminService.generateSnapshot(force, complete)
          this.alertRes('success', res.data, 'Successfully created snapshot')
          this.getSnapshots()
        } catch (err) {
          this.handleError(err, 'Unable to generate a snapshot')
        } finally {
          this.generatingSnapshot = false
        }
      },
      alertRes (kind, data, defaultMessage) {
        let msg = defaultMessage
        if (data && typeof data === 'object') {
          if (data.msg) {
            msg = data.msg
          } else if (data.translation) {
            msg = '' + this.$t(data.translation)
          }
        }
        this.alert(kind, msg)
      },
      handleError (err, defaultMessage) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    }
  }
</script>

<style lang="sass" scoped>
  .textarea-wrapper
    flex: 0 0 100%
  .textarea-wrapper > textarea
    width: 100%
    border: 1px solid #dd2c00
    overflow: scroll
</style>

