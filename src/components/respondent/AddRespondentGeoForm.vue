<template>
  <TrellisModal
    :value="value"
    @input="close"
    :title="$t('add_location')">
    <v-card>
      <v-card-text>
          <v-layout>
            <v-flex>
              Location
              <v-chip v-if="selectedGeo">
                <AsyncTranslationText :translation="selectedGeo.nameTranslation" />
              </v-chip>
            </v-flex>
            <v-spacer />
            <v-btn @click="showGeoSearch=true">
              {{selectedGeo ? $t('select_location') : $t('add_location')}}
            </v-btn>
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
    <TrellisModal v-model="showGeoSearch" :title="$t('location_search')">
      <v-card>
        <GeoSearch
          :showCart="true"
          :limit="1"
          :isSelectable="geoSelectionFilter"
          :should-update-route="false"
          @doneSelecting="geoSelected" />
      </v-card>
    </TrellisModal>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

import GeoSearch from '@/components/geo/GeoSearch.vue'
import TrellisModal from '../TrellisModal.vue'
import AsyncTranslationText from '../AsyncTranslationText.vue'

import RespondentService from '../../services/respondent'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
export default Vue.extend({
  components: { GeoSearch, TrellisModal, AsyncTranslationText },
  name: 'AddRespondentGeoForm',
  data () {
    return {
      isCurrent: true,
      showGeoSearch: false,
      selectedGeo: null,
    }
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
    respondent: {
      type: Object,
      required: true,
    },
    geoSelectionFilter: {
      default: true,
    },
  },
  methods: {
    geoSelected (geos) {
      this.selectedGeo = geos[0]
      console.log(this.selectedGeo)
      this.showGeoSearch = false
    },
    async done () {
      try {
        if (this.respondent && this.selectedGeo) {
          const rGeo: RespondentGeo = await RespondentService.addRespondentGeo(this.respondent.id, this.selectedGeo.id, this.isCurrent)
          this.$emit('added', rGeo)
          this.close()
        }
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    close () {
      this.$emit('input', false)
      this.selectedGeo = null
      this.isCurrent = false
    },
  },
})
</script>
