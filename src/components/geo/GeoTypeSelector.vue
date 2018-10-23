<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12>
        <v-select
          single-line
          :items="geoTypes"
          v-model="curGeoType"
          item-text="name"
          label="Select a location type">
        </v-select>
        <v-btn
          :disabled="curGeoType === null || geoTypeSelected"
          flat
          right
          @click="selectGeoType">
          Select
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'

  export default {
    name: 'geo-type-selector',
    created: function () {
      GeoService.getGeoTypesByStudy(global.study.id, this.showUserAddable)
        .then((geoTypes) => {
          this.geoTypes = geoTypes
        })
    },
    props: {
      showUserAddable: {
        type: Boolean,
        required: false,
        'default': false
      }
    },
    data: function () {
      return {
        geoTypes: [],
        curGeoType: null,
        geoTypeSelected: false
      }
    },
    methods: {
      selectGeoType: function () {
        this.geoTypeSelected = true
        this.$emit('geo-type-selected', this.curGeoType)
      }
    }
  }
</script>

<style scoped>

</style>
