<template>
  <TrellisFileUpload
    v-bind="$attrs"
    v-on="$listeners"
    :extensions="['zip']"
    :title="$t('import_respondent_photos')"
    :uploadFile="importPhotos" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentPhotoImport',
    components: { TrellisFileUpload },
    methods: {
      importPhotos (file: File) {
        return RespondentService.importRespondentPhotos(file, global.study.id)
      }
    }
  })
</script>
