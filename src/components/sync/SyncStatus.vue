<template>
  <v-layout>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">Sync Status</h3>
        </v-card-title>
        <v-card-text>
          <v-alert
            v-bind:value="!wasSnapshotDownloaded"
            type="info">
            No download found. Click the download button below.
          </v-alert>
          <v-alert
            v-bind:value="wasSnapshotDownloaded"
            type="info">
            The last snapshot was downloaded on: <span style="white-space:nowrap">{{ snapshotDownloadedAt }}</span>.
          </v-alert>
          <v-alert
            v-bind:value="areUpdatedRecords"
            type="info">
            There are {{ updatedRecordsCount }} unsynced rows in the database. Click the upload button below.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  /* TODO: Consider adding information about the last upload here. */
  import DateService from '../../services/DateService'
  export default {
    name: 'sync-status',
    data () {
      return {
      }
    },
    created () {
    },
    props: {
      localLatestSnapshot: {
        type: Object,
        'default': null
      },
      updatedRecordsCount: {
        type: Number,
        'default': null
      }
    },
    methods: {
    },
    computed: {
      wasSnapshotDownloaded: function () {
        return (this.localLatestSnapshot)
      },
      snapshotDownloadedAt: function () {
        if (this.localLatestSnapshot && this.localLatestSnapshot.hasOwnProperty('createdAt')) {
          return DateService.parseDate(this.localLatestSnapshot['createdAt']).local().format('llll')
        } else {
          return ''
        }
      },
      areUpdatedRecords: function () {
        return (this.updatedRecordsCount !== null && this.updatedRecordsCount > 0)
      }
    },
    components: {
    }
  }
</script>

<style lang="sass" scoped>
</style>
