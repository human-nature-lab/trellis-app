<template>
  <v-flex>
    <file-upload
      input-id="geo"
      class="btn primary"
      extensions="csv"
      v-model="files"
      :drop="true"
      @input="importGeos" >
      <TrellisLoadingCircle size="25px" v-if="isWorking" />
      <div class="btn__content" v-else>
        {{$t('import_locations')}}
      </div>
    </file-upload>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import FileUpload from 'vue-upload-component'

  export default Vue.extend({
    name: 'GeoImport',
    components: { TrellisLoadingCircle, FileUpload },
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
