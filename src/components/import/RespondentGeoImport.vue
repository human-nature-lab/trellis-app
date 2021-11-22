<template>
  <TrellisFileUpload 
    input-id="respondent-geo"
    extensions="csv"
    @input="importRespondentGeos">
    {{$t('import_respondent_geos')}}
  </TrellisFileUpload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import RespondentService from '../../services/respondent/RespondentService'
  import TrellisFileUpload from './TrellisFileUpload.vue'

  export default Vue.extend({
    name: 'RespondentGeoImport',
    components: { TrellisFileUpload },
    data () {
      return {
        isWorking: false,
        global
      }
    },
    methods: {
      async importRespondentGeos (files: File[]) {
        try {
          this.isWorking = true
          await RespondentService.importRespondentGeos(files[0]['file'], this.global.study.id)
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
