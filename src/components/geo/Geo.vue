<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <geo-search
          :show-add-location-button="true"
          v-on:parent-geo-id-changed="onParentGeoChanged">
        </geo-search>
      </v-flex>
    </v-layout>
    <v-fab-transition>
      <v-btn
        v-show="!adding && canUserAddChild"
        class="deep-orange"
        @click="addLocation"
        fab
        dark
        fixed
        bottom
        right>
        <v-icon style="height:auto;">add</v-icon>
      </v-btn>
    </v-fab-transition>
    <add-geo-form
      @close="addLocationClose"
      :adding="adding"
      :parentGeoId="parentGeoId">
    </add-geo-form>
  </v-container>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import GeoSearch from './GeoSearch.vue'
  import AddGeoForm from './AddGeoForm.vue'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'

  export default {
    name: 'geo',
    data () {
      return {
        parentGeoId: null,
        adding: false,
        canUserAddChild: false
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
      AddGeoForm
    },
    methods: {
      addLocationClose (addedLocation) {
        this.adding = false
        if (addedLocation instanceof Geo) {
          console.log('geo added', addedLocation, global.locale)
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
        let parentGeo = await GeoService.getGeoById(this.parentGeoId)
        this.canUserAddChild = (parentGeo && parentGeo.hasOwnProperty('geoType')) ? parentGeo.geoType.canUserAddChild : false
      }
    }
  }
</script>

<style lang="sass">
</style>
