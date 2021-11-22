<template>
  <TrellisFileUpload
    extensions="zip"
    v-model="files"
    @input="importPhotos">
    {{$t('import_location_photos')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'GeoPhotoImport',
    components: { TrellisFileUpload },
    data () {
      return {
        global,
        isWorking: false,
        files: []
      }
    },
    methods: {
      async importPhotos (files: object[]) {
        try {
          this.isWorking = true
          await GeoService.importGeoPhotos(this.global.study.id, files[0]['file'])
          this.alert('success', this.$t('import_success'))
          this.$emit('import-photos')
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('import_failed'))
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
