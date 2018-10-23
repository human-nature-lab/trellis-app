<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <geo-search
          :show-add-location-button="true">
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
    <v-dialog
      v-model="adding">
      <v-card>
        <add-geo-form
          @close="addLocationClose"
          :parentGeoId="selectedGeoId">
        </add-geo-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import GeoSearch from './GeoSearch.vue'
  import AddGeoForm from './AddGeoForm.vue'

  export default {
    name: 'geo',
    data () {
      return {
        selectedGeoId: null,
        adding: false
      }
    },
    components: {
      GeoSearch,
      AddGeoForm
    },
    methods: {
      addLocationClose (addedLocation) {
        console.log('addLocationClose -> addedLocation', addedLocation)
        this.adding = false
      },
      addLocation () {
        this.adding = true
        console.log('addLocation')
      }
    }
  }
</script>

<style lang="sass">
</style>
