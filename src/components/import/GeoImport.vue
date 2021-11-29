<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['csv']"
    :title="$t('import_locations')"
    :uploadFile="importGeos">
    <template #error="{ error }">
      <div v-html="error.response.data" />
    </template>
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
      }
    },
    methods: {
      importGeos (file: File) {
        return GeoService.importGeos(global.study.id, file)
      }
    }
  })
</script>
