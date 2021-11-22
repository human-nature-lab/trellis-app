<template>
  <TrellisFileUpload
    extensions="csv"
    v-model="files"
    :drop="true"
    @input="importGeos">
    {{$t('import_locations')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'GeoImport',
    components: { TrellisFileUpload },
    data () {
      return {
        global,
        isWorking: false,
        files: []
      }
    },
    methods: {
      async importGeos (files: object[]) {
        try {
          this.isWorking = true
          const geos = await GeoService.importGeos(this.global.study.id, files[0]['file'])
          this.$emit('updateGeos', geos)
          this.alert('success', this.$t('import_success'))
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
