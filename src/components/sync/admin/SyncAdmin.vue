<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 sm12 md6 lg6 xl6>
        <v-card>
          <v-card-title>
            <h3 class="headline mb-0">
              {{ $t('snapshots') }}
            </h3>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :pagination.sync="snapshotPagination"
              :loading="snapshotsLoading"
              :headers="snapshotColumns"
              :items="snapshots">
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
                <td>{{ props.item.created_at }}</td>
                <td>{{ props.item.file_name }}</td>
              </template>
              <template slot="no-data">
                <v-alert :value="!snapshotsLoading" type="info">
                  {{ $t('no_results') }}
                </v-alert>
                <span v-if="snapshotsLoading">
                  {{ $t('loading') }}
                </span>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-btn
              flat
              :loading="generatingSnapshot"
              :disabled="generatingSnapshot"
              @click="generateSnapshot">
              {{ $t('generate_snapshot') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 sm12 md6 lg6 xl6>
        <v-card>
          <v-card-title>
            <h3 class="headline mb-0">
              {{ $t('uploads') }}
            </h3>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              :label="$t('search')"
              single-line
              hide-details>
            </v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :pagination.sync="uploadPagination"
              :loading="uploadsLoading"
              :headers="uploadColumns"
              :items="uploadsFiltered">
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
                <tr>
                  <td>
                    <v-btn
                      :disabled="props.item.status !== 'SUCCESS' && props.item.status !== 'FAILED'"
                      icon
                      @click="props.item.isOpen = !props.item.isOpen">
                      <v-icon v-if="props.item.isOpen">keyboard_arrow_down</v-icon>
                      <v-icon v-else>keyboard_arrow_right</v-icon>
                    </v-btn>
                  </td>
                  <td>{{ props.item.created_at }}</td>
                  <td>{{ props.item.status }}</td>
                  <td>{{ (props.item.device_name) ? props.item.device_name : $t('not_found') }}</td>
                  <td>{{ props.item.device_id }}</td>
                  <td>{{ props.item.file_name }}</td>
                </tr>
                <UploadLogs
                  :upload="props.item"
                  :isOpen="props.item.status === 'SUCCESS' && props.item.isOpen"/>
                <tr v-if="props.item.status === 'FAILED' && props.item.isOpen" >
                  <td colspan="6">
                    <v-alert
                      value="true"
                      type="error"
                      outline>
                      <v-layout row wrap>
                        <v-flex>
                          {{ props.item.error_message }}
                        </v-flex>
                      </v-layout>
                      <v-layout row wrap>
                        <v-flex xs12>
                          <div class="textarea-wrapper">
                            <textarea
                              readonly
                              rows="10"
                              :value="props.item.error_trace">
                            </textarea>
                          </div>
                        </v-flex>
                      </v-layout>
                    </v-alert>
                  </td>
                </tr>
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
          <v-card-actions>
            <v-btn
              flat
              :loading="uploadsProcessing"
              :disabled="uploadsProcessing"
              @click="processUploads">
              {{ $t('process_uploads') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import SyncAdminService from '../../../services/SyncAdminService'
  import UploadLogs from './UploadLogs'
  import DocsLinkMixin from '../../../mixins/DocsLinkMixin'
  import DocsFiles from '../../documentation/DocsFiles'
  export default {
    name: 'sync-admin',
    mixins: [DocsLinkMixin(DocsFiles.sync.admin)],
    components: {UploadLogs},
    data () {
      return {
        uploadPagination: {
          sortBy: 'created_at',
          descending: true
        },
        snapshotPagination: {
          sortBy: 'created_at',
          descending: true
        },
        generatingSnapshot: false,
        search: '',
        snapshotsLoading: true,
        snapshots: [],
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
        uploadsLoading: true,
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
    created () {
      this.getUploads()
      this.getSnapshots()
    },
    props: {
    },
    computed: {
      uploadsFiltered: function () {
        return this.uploads.filter((upload) => upload.device_name.toLowerCase().indexOf(this.search.toLowerCase()) > -1)
      }
    },
    methods: {
      getUploads: async function () {
        const uploads = await SyncAdminService.listUploads()
        this.uploads = uploads.map(u => {
          u.isOpen = false
          return u
        })
        this.uploadsLoading = false;
      },
      getSnapshots: async function () {
        const snapshots = await SyncAdminService.listSnapshots()
        this.snapshots = snapshots
        this.snapshotsLoading = false;
      },
      processUploads: async function () {
        this.uploadsProcessing = true
        try {
          await SyncAdminService.processUploads()
          this.uploadsProcessing = false
          this.getUploads()
        } catch (err) {
          this.uploadsProcessing = false
          console.error(err)
        }
      },
      generateSnapshot: async function () {
        this.generatingSnapshot = true
        try {
          await SyncAdminService.generateSnapshot()
          this.generatingSnapshot = false
          this.getSnapshots()
        } catch (err) {
          this.generatingSnapshot = false
          console.error(err)
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

