<template>
  <v-dialog
    lazy
    :value="value"
    @input="close">
    <v-card>
      <ModalTitle
        :title="$t('add_location')"
        @close="close" />
      <v-card-text>
          <v-layout>
            <v-flex>Location</v-flex>
            <v-flex v-if="selectedGeo">
              <v-chip>
                <AsyncTranslationText :translation="selectedGeo.nameTranslation" />
              </v-chip>
            </v-flex>
            <v-flex>
              <v-btn @click="showGeoSearch=true">
                {{selectedGeo ? $t('change_location') : $t('add_location')}}
              </v-btn>
            </v-flex>
          </v-layout>
          <v-layout>
            <v-checkbox v-model="isCurrent" :label="$t('current_geo_location')" />
            <v-spacer></v-spacer>
            <v-btn @click="done" :disabled="!selectedGeo">
              {{$t('save')}}
            </v-btn>
          </v-layout>
      </v-card-text>
    </v-card>
    <v-dialog lazy v-model="showGeoSearch">
      <ModalTitle :title="$t('location_search')" @close="showGeoSearch=false" />
      <GeoSearch
        :limit="1"
        :is-selectable="true"
        :should-update-route="false"
        @doneSelecting="geoSelected" />
    </v-dialog>
  </v-dialog>
</template>

<script lang="ts">
  import Vue from 'vue'

  // @ts-ignore
  import GeoSearch from '../geo/GeoSearch'
  // @ts-ignore
  import ModalTitle from '../ModalTitle'
  // @ts-ignore
  import AsyncTranslationText from '../AsyncTranslationText'

  import RespondentService from "../../services/respondent/RespondentService"
  import RespondentGeo from "../../entities/trellis/RespondentGeo"
  export default Vue.extend({
    components: {GeoSearch, ModalTitle, AsyncTranslationText},
    name: 'AddRespondentGeoForm',
    data () {
      return {
        isCurrent: false,
        showGeoSearch: false,
        selectedGeo: null
      }
    },
    props: {
      value: {
        type: Boolean,
        required: true
      },
      respondent: {
        type: Object,
        required: true
      }
    },
    methods: {
      geoSelected (geos) {
        this.selectedGeo = geos[0]
        console.log(this.selectedGeo)
        this.showGeoSearch = false
      },
      async done () {
        if (this.respondent && this.selectedGeo) {
          const rGeo: RespondentGeo = await RespondentService.addRespondentGeo(this.respondent.id, this.selectedGeo.id, this.isCurrent)
          this.$emit('added', rGeo)
          this.close()
        }
      },
      close () {
        this.$emit('input', false)
        this.selectedGeo = null
        this.isCurrent = false
      }
    }
  })
</script>

<style scoped>

</style>
