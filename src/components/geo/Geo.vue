<template>
  <v-container fill-height>
    <v-layout>
      <v-col>
        <geo-search
          :show-add-location-button="!adding && canUserAddChild"
          @add="addLocation"
          v-on:parent-geo-id-changed="onParentGeoChanged"
        ></geo-search>
      </v-col>
    </v-layout>
    <!-- <v-fab-transition>
      <v-btn
        v-show="!adding && canUserAddChild"
        class="deep-orange"
        @click="addLocation"
        fab
        dark
        fixed
        bottom
        right>
        <v-icon style="height:auto;">mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>-->
    <add-geo-form
      v-if="adding"
      @close="addLocationClose"
      :adding="adding"
      :parentGeoId="parentGeoId"
    ></add-geo-form>
  </v-container>
</template>

<script>
import Geo from '../../entities/trellis/Geo'
import GeoSearch from './GeoSearch.vue'
import AddGeoForm from './AddGeoForm.vue'
import GeoService from '../../services/geo'
import DocsFiles from '../documentation/DocsFiles'
import DocsLinkMixin from '../../mixins/DocsLinkMixin'
import { routeQueue } from '../../router'

export default {
  name: 'geo',
  mixins: [DocsLinkMixin(DocsFiles.locations.search)],
  data() {
    return {
      parentGeoId: null,
      adding: false,
      canUserAddChild: false
    }
  },
  created() {
    if (this.$route.query.filters) {
      this.parentGeoId = JSON.parse(this.$route.query.filters).parent
      this.setCanUserAddChild()
    }
  },
  components: {
    GeoSearch,
    AddGeoForm
  },
  methods: {
    addLocationClose(addedLocation) {
      this.adding = false
      if (addedLocation instanceof Geo) {
        routeQueue.push({
          name: 'Geo',
          params: {
            geoId: addedLocation.id
          }
        })
      }
    },
    addLocation() {
      this.adding = true
    },
    onParentGeoChanged(parentGeoId) {
      this.parentGeoId = parentGeoId
      this.setCanUserAddChild()
    },
    async setCanUserAddChild() {
      try {
        let parentGeo = await GeoService.getGeoById(this.parentGeoId)
        this.canUserAddChild = (parentGeo && parentGeo.hasOwnProperty('geoType')) ? parentGeo.geoType.canUserAddChild : false
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    }
  }
}
</script>
