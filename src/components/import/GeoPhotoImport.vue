<template>
    <v-flex>
      <file-upload
        input-id="geo-photo"
        class="btn primary"
        extensions="zip"
        :drop="true"
        v-model="files"
        @input="importPhotos" >
        <TrellisLoadingCircle size="25px" v-if="isWorking" />
        <div class="btn__content" v-else>
          {{$t('import_location_photos')}}
        </div>
      </file-upload>
    </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'

  export default Vue.extend({
    name: 'GeoPhotoImport',
    components: { TrellisLoadingCircle, FileUpload },
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
