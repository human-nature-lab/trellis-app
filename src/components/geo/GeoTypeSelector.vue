<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12>
        <v-select
          single-line
          :items="geoTypes"
          v-model="curGeoType"
          item-text="name"
          :label="$t('select_location_type')">
        </v-select>
        <v-btn
          :disabled="curGeoType === null || disableButton"
          flat
          right
          @click="selectGeoType">
          {{ $t('select') }}
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import GeoType from '../../entities/trellis/GeoType'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'

  export default {
    name: 'geo-type-selector',
    created: function () {
      GeoService.getGeoTypesByStudy(global.study.id, this.showUserAddable)
        .then((geoTypes) => {
          this.geoTypes = geoTypes
          if (this.geoType) {
            this.curGeoType = this.geoTypes.find((gt) => gt.id === this.geoType.id)
          }
        })
    },
    props: {
      disableButton: {
        type: Boolean,
        required: false,
        'default': false
      },
      showUserAddable: {
        type: Boolean,
        required: false,
        'default': false
      },
      geoType: {
        type: GeoType,
        required: false
      }
    },
    data: function () {
      return {
        geoTypes: [],
        curGeoType: null
      }
    },
    methods: {
      selectGeoType: function () {
        this.$emit('geo-type-selected', this.curGeoType)
      }
    }
  }
</script>

<style scoped>

</style>
