<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <geo-search
          :show-add-location-button="true"
          v-on:parent-geo-changed="onParentGeoChanged">
        </geo-search>
      </v-flex>
    </v-layout>
    <v-fab-transition>
      <v-btn
        v-show="!adding"
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
  import GeoSearch from './GeoSearch.vue'
  import AddGeoForm from './AddGeoForm.vue'

  export default {
    name: 'geo',
    data () {
      return {
        parentGeoId: null,
        adding: false
      }
    },
    created () {
      if (this.$route.query.filters) {
        this.parentGeoId = JSON.parse(this.$route.query.filters).parent
      }
    },
    components: {
      GeoSearch,
      AddGeoForm
    },
    methods: {
      addLocationClose (addedLocation) {
        this.adding = false
      },
      addLocation () {
        this.adding = true
      },
      onParentGeoChanged (parentGeoId) {
        this.parentGeoId = parentGeoId
      }
    }
  }
</script>

<style lang="sass">
</style>
