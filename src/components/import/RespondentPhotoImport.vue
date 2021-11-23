<template>
  <TrellisFileUpload
    :extensions="['zip']"
    :title="$t('import_respondent_photos')"
    :uploadFile="importPhotos" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentPhotoImport',
    components: { TrellisFileUpload },
    methods: {
      async importPhotos (file: File) {
        try {
          await RespondentService.importRespondentPhotos(file, global.study.id)
        } catch (err) {
          console.error(err)
          throw err
        }
      }
    }
  })
</script>
