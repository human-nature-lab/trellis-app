<template>
  <v-select
    dense
    hide-details
    :outlined="outlined"
    :disabled="disabled"
    :readonly="readonly || (clickToEdit && !editing)"
    :append-outer-icon="(clickToEdit && !editing) ? 'mdi-pencil' : undefined"
    @click:append-outer="clickAppend"
    return-object
    :items="geoTypes"
    v-model="curGeoType"
    item-text="name"
    @change="selectGeoType"
    :label="$t('geo_type')">
  </v-select>
</template>

<script>
  /* TODO: When @click:append exists, clicking the menu-down icon does nothing. Can we remove this attribute selectively? */
  import GeoType from '../../entities/trellis/GeoType'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'

  export default {
    name: 'GeoTypeSelect',
    async created () {
      try {
        this.geoTypes = await GeoService.getGeoTypesByStudy(global.study.id, this.showUserAddable)
        if (this.geoType || this.geoTypeId) {
          const gtid = (this.geoType) ? this.geoType.id : this.geoTypeId
          this.curGeoType = this.geoTypes.find((gt) => gt.id === gtid)
        }
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    props: {
      outlined: {
        type: Boolean,
        required: false,
        'default': true
      },
      disabled: {
        type: Boolean,
        required: false,
        'default': false
      },
      clickToEdit: {
        type: Boolean,
        required: false,
        'default': false
      },
      readonly: {
        type: Boolean,
        required: false,
        'default': false
      },
      geoType: {
        type: GeoType,
        required: false
      },
      geoTypeId: {
        type: String,
        required: false
      },
      showUserAddable: {
        type: Boolean,
        required: false,
        'default': false
      },
    },
    data: function () {
      return {
        geoTypes: [],
        curGeoType: null,
        editing: false
      }
    },
    methods: {
      clickAppend: function () {
        if (this.clickToEdit) {
          this.editing = true
        }
      },
      selectGeoType: function () {
        if (this.editing && this.clickToEdit) {
          this.editing = false
        }
        this.$emit('geoTypeSelected', this.curGeoType)
      }
    }
  }
</script>

<style scoped>
</style>
