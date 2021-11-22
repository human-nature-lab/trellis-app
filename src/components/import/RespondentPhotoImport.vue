<template>
  <TrellisFileUpload
    extensions="zip"
    @input="importPhotos">
    {{$t('import_respondent_photos')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentPhotoImport',
    components: { TrellisFileUpload },
    data () {
      return {
        global,
        isWorking: false
      }
    },
    methods: {
      async importPhotos (files: object[]) {
        try {
          this.isWorking = true
          await RespondentService.importRespondentPhotos(files[0]['file'], this.global.study.id)
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
