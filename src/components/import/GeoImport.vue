<template>
  <TrellisFileUpload
    :extensions="['csv']"
    :title="$t('import_locations')"
    :uploadFile="importGeos" />
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
      }
    },
    methods: {
      async importGeos (file: File) {
        try {
          const geos = await GeoService.importGeos(global.study.id, file)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
