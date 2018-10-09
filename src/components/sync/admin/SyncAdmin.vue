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
          </v-card-title>
          <v-card-text>
            <v-data-table
              :pagination.sync="uploadPagination"
              :loading="uploadsLoading"
              :headers="uploadColumns"
              :items="uploads">
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="items" slot-scope="props">
                <td>{{ props.item.created_at }}</td>
                <td>{{ props.item.file_name }}</td>
                <td>{{ props.item.device_id }}</td>
                <td>{{ props.item.status }}</td>
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

  export default {
    name: 'sync-admin',
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
        uploadColumns: [
          {
            text: 'Created on',
            value: 'created_at'
          },
          {
            text: 'File name',
            value: 'file_name'
          },
          {
            text: 'Device id',
            value: 'device_id'
          },
          {
            text: 'Status',
            value: 'status'
          }
        ]
      }
    },
    created () {
      this.getUploads()
      this.getSnapshots()
    },
    props: {
    },
    computed: {
    },
    methods: {
      getUploads: async function () {
        const uploads = await SyncAdminService.listUploads()
        this.uploads = uploads
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

