<template>
  <v-container fill-height class="pa-0">
    <geo-search
      :show-add-location-button="!adding && canUserAddChild"
      @add="addLocation"
      @parent-geo-id-changed="onParentGeoChanged"
    />
    <add-geo-form
      v-if="adding"
      @close="addLocationClose"
      :adding="adding"
      :parent-geo-id="parentGeoId"
    />
  </v-container>
</template>

<script>
import Geo from '@/entities/trellis/Geo'
import GeoSearch from '@/components/geo/GeoSearch.vue'
import AddGeoForm from '@/components/geo/AddGeoForm.vue'
import GeoService from '@/services/geo'
import DocsFiles from '@/components/documentation/DocsFiles'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import { routeQueue } from '@/router'

export default {
  name: 'Geo',
  mixins: [DocsLinkMixin(DocsFiles.locations.search)],
  data () {
    return {
      parentGeoId: null,
      adding: false,
      canUserAddChild: false,
    }
  },
  created () {
    if (this.$route.query.filters) {
      this.parentGeoId = JSON.parse(this.$route.query.filters).parent
      this.setCanUserAddChild()
    }
  },
  components: {
    GeoSearch,
    AddGeoForm,
  },
  methods: {
    addLocationClose (addedLocation) {
      this.adding = false
      if (addedLocation instanceof Geo) {
        routeQueue.push({
          name: 'Geo',
          params: {
            geoId: addedLocation.id,
          },
        })
      }
    },
    addLocation () {
      this.adding = true
    },
    onParentGeoChanged (parentGeoId) {
      this.parentGeoId = parentGeoId
      this.setCanUserAddChild()
    },
    async setCanUserAddChild () {
      try {
        const parentGeo = await GeoService.getGeoById(this.parentGeoId)
        this.canUserAddChild = (parentGeo && parentGeo.hasOwnProperty('geoType')) ? parentGeo.geoType.canUserAddChild : false
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
  },
}
</script>
