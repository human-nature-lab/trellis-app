<template>
  <v-flex xs1>
    <v-menu>
      <v-btn slot="activator" icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile @click="showGeosImport = true">
          {{$t('import_locations')}}
        </v-list-tile>
        <v-list-tile @click="showPhotosImport = true">
          {{$t('import_location_photos')}}
        </v-list-tile>
      </v-list>
    </v-menu>
    <TrellisModal
      v-model="showGeosImport"
      :title="$t('import_locations')">
      <v-layout column>
        <v-flex>
          Locations can be imported in bulk using a CSV file. The CSV should have the following columns: id, name, geo_type, latitude, longitude, altitude, parent_id
        </v-flex>
        <v-flex>
          <v-layout>
            <v-spacer />
            <file-upload
              class="btn"
              extensions=".csv"
              :drop="true"
              @input="importGeos" >
              <TrellisLoadingCircle size="25px" v-if="isWorking" />
              <div class="btn__content" v-else>
                {{$t('choose_file')}}
              </div>
            </file-upload>
          </v-layout>
        </v-flex>
      </v-layout>
    </TrellisModal>
    <TrellisModal
      v-model="showPhotosImport"
      :title="$t('import_location_photos')">
      <v-layout column>
        <v-flex>
          Location photos are imported
        </v-flex>
      </v-layout>
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoService from '../../services/geo/GeoService'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import TrellisModal from '../TrellisModal.vue'
  import FileUpload from 'vue-upload-component'
  import global from '../../static/singleton'

  export default Vue.extend({
    name: 'GeoImport',
    components: { TrellisModal, FileUpload, TrellisLoadingCircle },
    data () {
      return {
        global,
        isWorking: false,
        showGeosImport: false,
        showPhotosImport: false
      }
    },
    methods: {
      async importGeos (files: object[]) {
        try {
          this.isWorking = true
          const geos = await GeoService.importGeos(this.global.study.id, files[0]['file'])
          this.$emit('updateGeos', geos)
        } catch (err) {
          this.log(err)
          this.alert('error', err, { timeout: 0 })
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass" scoped>

</style>
