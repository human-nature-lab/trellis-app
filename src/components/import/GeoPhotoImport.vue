<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['zip']"
    :title="$t('import_location_photos')"
    :uploadFile="importPhotos">
    <template #error="{ error }">
      {{error.response.data.msg}}
    </template>
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'GeoPhotoImport',
    components: { TrellisFileUpload },
    methods: {
      importPhotos (file: File) {
        return GeoService.importGeoPhotos(global.study.id, file)
      }
    }
  })
</script>
