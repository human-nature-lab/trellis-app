<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12>
        <v-select
          single-line
          return-object
          :items="geoTypes"
          v-model="curGeoType"
          item-text="name"
          :label="$t('select_location_type')">
        </v-select>
        <v-btn
          :disabled="curGeoType === null || disableButton"
          text
          right
          @click="selectGeoType">
          {{ $t('select') }}
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import GeoType from '../../entities/trellis/GeoType'
  import GeoService from '../../services/geo'
  import global from '../../static/singleton'

  export default {
    name: 'geo-type-selector',
    async created () {
      try {
        this.geoTypes = await GeoService.getGeoTypesByStudy(global.study.id, this.showUserAddable)
        if (this.geoType) {
          this.curGeoType = this.geoTypes.find((gt) => gt.id === this.geoType.id)
        }
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
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
