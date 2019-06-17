<template>
  <file-upload
    input-id="respondent-photo"
    class="btn primary"
    extensions="zip"
    :drop="true"
    @input="importPhotos">
    <TrellisLoadingCircle size="25px" v-if="isWorking" />
    <div class="btn__content" v-else>
      {{$t('import_respondent_photos')}}
    </div>
  </file-upload>
</template>

<script lang="ts">
  import Vue from 'vue'
  import RespondentService from '../../services/respondent/RespondentService'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'

  export default Vue.extend({
    name: 'RespondentPhotoImport',
    components: { TrellisLoadingCircle, FileUpload },
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
          this.log(err)
          let message = this.$t('import_failed')
          if (err && err.response && err.response.data && err.response.data.msg) {
            message = err.response.data.msg
          }
          this.alert('error', message, {timeout: 0})
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>
