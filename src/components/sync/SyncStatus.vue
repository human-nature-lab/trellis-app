<template>
  <v-layout>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-card-title>
          <h3 class="headline mb-0">
            <DocsLinkBadge to="syncing/Introduction.md">{{ $t('sync_status') }}</DocsLinkBadge>
          </h3>
        </v-card-title>
        <v-card-text>
          <v-alert
            :value="!wasSnapshotDownloaded"
            type="info">
            {{$t('no_snapshot_found_local')}} {{$t('click_download_button')}}
          </v-alert>
          <v-alert
            :value="wasSnapshotDownloaded"
            type="info">
            {{$t('snapshot_created_at')}} <span style="white-space:nowrap">{{ snapshotDownloadedAt }}</span>.
          </v-alert>
          <v-alert
            :value="areUpdatedRecords"
            type="info">
            {{$t('unsynced_rows', [updatedRecordsCount])}}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  /* TODO: Consider adding information about the last upload here. */
  import DateService from '../../services/DateService'
  import DocsLinkBadge from '../documentation/DocsLinkBadge'
  export default {
    components: {DocsLinkBadge},
    name: 'sync-status',
    props: {
      localLatestSnapshot: {
        type: Object
      },
      updatedRecordsCount: {
        type: Number
      }
    },
    computed: {
      wasSnapshotDownloaded: function () {
        return (this.localLatestSnapshot)
      },
      snapshotDownloadedAt: function () {
        if (this.localLatestSnapshot && this.localLatestSnapshot.hasOwnProperty('snapshotCreatedAt')) {
          return DateService.parseDate(this.localLatestSnapshot['snapshotCreatedAt']).local().format('llll')
        } else {
          return ''
        }
      },
      areUpdatedRecords: function () {
        return (this.updatedRecordsCount !== null && this.updatedRecordsCount > 0)
      }
    }
  }
</script>
