<template>
  <v-col>
    <v-col class="text-h5">
      {{ $t('sync_status') }}
    </v-col>
    <v-col>
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
    </v-col>
  </v-col>
</template>

<script>
  /* TODO: Consider adding information about the last upload here. */
  import DateService from '../../services/DateService'
  import DocsLinkBadge from '../documentation/DocsLinkBadge.vue'
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
        return !!this.localLatestSnapshot
      },
      snapshotDownloadedAt: function () {
        if (this.localLatestSnapshot && this.localLatestSnapshot.hasOwnProperty('snapshotCreatedAt')) {
          return DateService.parseDate(this.localLatestSnapshot.snapshotCreatedAt).local().format('llll')
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
