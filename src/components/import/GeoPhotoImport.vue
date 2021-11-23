<template>
  <TrellisFileUpload
    :extensions="['zip']"
    :title="$t('import_location_photos')"
    :uploadFile="importPhotos" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'GeoPhotoImport',
    components: { TrellisFileUpload },
    methods: {
      async importPhotos (file: File) {
        try {
          await GeoService.importGeoPhotos(global.study.id, file)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
