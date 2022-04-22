<template>
  <InfoBlock
    :title="$t('storage')"
    :items="items"
    :to="{name: 'Storage'}" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import PhotoService from '../../services/photo'
  import formatBytesFilter from '../../filters/format-bytes.filter'
  import InfoBlock from './InfoBlock.vue'

  export default Vue.extend({
    name: "StorageInfo",
    components: { InfoBlock },
    data () {
      return {
        photoFiles: {
          key: this.$t('device_photos'),
          val: null
        },
        photoEntries: {
          key: this.$t('db_photos'),
          val: null
        },
        photosSize: {
          key: this.$t('photos_size'),
          val: null
        }
      }
    },
    created () {
      PhotoService.getPhotoCount().then(c => this.photoEntries.val = c)
      PhotoService.getPhotoFileCount().then(c => this.photoFiles.val = c)
      PhotoService.getPhotosSize().then(size => this.photosSize.val = formatBytesFilter(size))
    },
    computed: {
      items (): object[] {
        return [this.photoFiles, this.photoEntries, this.photosSize]
      }
    }
  })
</script>
