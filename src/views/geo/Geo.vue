<template>
  <v-container
    fill-height
    class="pa-0"
  >
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
import { computedTitle } from '@/router/history'
import TranslationService from '@/services/TranslationService'

export default {
  name: 'Geo',
  mixins: [DocsLinkMixin(DocsFiles.locations.search)],
  data () {
    return {
      parentGeoId: null,
      parentGeo: null,
      adding: false,
      canUserAddChild: false,
    }
  },
  created () {
    computedTitle('GeoSearch', () => {
      if (this.parentGeoName) {
        return { key: 'location_search_in', args: [this.parentGeoName] }
      }
      return { key: 'location_search' }
    })
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
      if (!this.parentGeoId) {
        this.canUserAddChild = false
        return
      }
      try {
        this.parentGeo = await GeoService.getGeoById(this.parentGeoId)
        console.log('loaded parent geo', this.parentGeo)
        this.canUserAddChild = (this.parentGeo && this.parentGeo.hasOwnProperty('geoType')) ? this.parentGeo.geoType.canUserAddChild : false
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
  },
  computed: {
    parentGeoName () {
      if (!this.parentGeo) {
        return null
      }
      const translation = TranslationService.getAny(this.parentGeo.nameTranslation)
      return (translation) || '[No translation]'
    },
  },
}
</script>
