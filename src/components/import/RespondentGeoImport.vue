<template>
  <v-flex>
    <file-upload
      input-id="respondent-geo"
      class="btn primary"
      extensions="csv"
      :drop="true"
      @input="importRespondentGeos" >
      <TrellisLoadingCircle size="25px" v-if="isWorking" />
      <div class="btn__content" v-else>
        {{$t('import_respondent_geos')}}
      </div>
    </file-upload>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'
  import RespondentService from '../../services/respondent/RespondentService'

  export default Vue.extend({
    name: 'RespondentGeoImport',
    components: { FileUpload, TrellisLoadingCircle },
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
          this.log(err)
          this.alert('error', this.$t('import_failed'), {timeout: 0})
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
