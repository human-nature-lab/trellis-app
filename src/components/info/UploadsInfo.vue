<template>
  <InfoBlock
    :title="$t('uploads')"
    :items="items"
    :to="{name: 'Sync'}" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import SyncService from '../../services/SyncService'
  import DatabaseService from '../../services/database'
  import InfoBlock from './InfoBlock.vue'

  export default Vue.extend({
    name: "UploadsInfo",
    components: { InfoBlock },
    data () {
      return {
        pendingPhotos: {key: this.$t('pending_photos') + '', val: null},
        pendingRows: {key:  this.$t('pending_rows') + '', val: null}
      }
    },
    created () {
      SyncService.getNewPhotosCount().then(c => this.pendingPhotos.val = c)
      DatabaseService.getUpdatedRecordsCount().then(c => this.pendingRows.val = c).catch(err => {
        this.log(err)
        this.pendingRows.val = 0
      })
    },
    computed: {
      items (): object[] {
        return [this.pendingPhotos, this.pendingRows]
      }
    }
  })
</script>
