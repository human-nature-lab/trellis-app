<template>
  <v-flex v-show="showPanel">
    <v-card>
      <v-btn
        icon
        flat
        absolute
        top
        right
        mt-5
        small
        style="top: 0"
        @click="closePanel"><v-icon>clear</v-icon></v-btn>
      <v-card-title>
        <translation-text-field
          v-if="curStatus === STATUS.EDIT_NAME || curStatus === STATUS.NEW_EDIT_NAME"
          :persist="(curStatus === STATUS.EDIT_NAME)"
          :translation="selectedGeo.nameTranslation"
          v-on:editing-cancelled="onEditingCancelled"
          v-on:editing-done="onEditingDone">
        </translation-text-field>
        <div slot="header" v-if="curStatus === STATUS.NEW_POSITION">
          <h2>New Location</h2>
          <p>Click on the map where you want to add this location.</p>
        </div>
        <div slot="header" v-if="curStatus === STATUS.SELECTED"><h2>{{ geoTranslation }}</h2></div>
        <div slot="header" v-if="curStatus === STATUS.MOVING">
          <h2>Moving {{ geoTranslation }}</h2>
          <p>Click on the map where you want to move this location.</p>
        </div>
      </v-card-title>
      <v-card-actions>
        <geo-type-selector
          v-if="curStatus === STATUS.NEW_GEO_TYPE"
          :show-user-addable="true"
          v-on:geo-type-selected="geoTypeSelected">
        </geo-type-selector>
        <span v-if="curStatus === STATUS.SELECTED">
          <v-btn flat @click="moveGeo">Move <v-icon right>my_location</v-icon></v-btn>
          <v-btn flat @click="renameGeo">Rename <v-icon right>edit</v-icon></v-btn>
          <v-btn flat @click="removeGeo">Delete <v-icon right>delete</v-icon></v-btn>
        </span>
        <v-switch v-if="curStatus === STATUS.MOVING" label="Move child elements to the same position" v-model="moveChildren"></v-switch>
        <v-btn v-if="curStatus === STATUS.MOVING" flat @click="cancelMoveGeo">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import Photo from '../Photo.vue'
  import AlertService from '../../services/AlertService'
  import TranslationService from '../../services/TranslationService'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TranslationTextField from '../TranslationTextField.vue'
  import GeoTypeSelector from './GeoTypeSelector.vue'

  const STATUS = {
    NO_GEO: 0, // No geo, new or existing, selected
    SELECTED: 1, // Existing geo selected, no action selected yet
    MOVING: 2, // Existing geo selected, moving selected
    EDIT_NAME: 3, // Existing geo selected, edit name selected
    NEW_POSITION: 4, // New geo, positioning
    NEW_GEO_TYPE: 5, // New geo, selecting geo type
    NEW_EDIT_NAME: 6, // New geo, editing name
  }

  export default {
    name: 'geo-edit-panel',
    props: {
      selectedGeo: {
        type: Geo,
        'default': null
      },
      leafletMap: {
        type: Object
      }
    },
    data: function () {
      return {
        global: global,
        moveChildren: false,
        STATUS: STATUS,
        curStatus: STATUS.SELECTED
      }
    },
    updated: function () {
      if (this.isNewGeo) {
        if (this.geoNeedsLocation) {
          this.curStatus = STATUS.NEW_POSITION
          const map = document.getElementById('leafletMap')
          map.style.cursor = 'crosshair'
          this.leafletMap.on('click', this.positionGeo)
        }
      }
    },
    methods: {
      positionGeo: function (evt) {
        console.log('addGeo', evt)
        this.selectedGeo.latitude = evt.latlng.lat
        this.selectedGeo.longitude = evt.latlng.lng
        this.cancelPositionGeo()
        this.$emit('position-geo-done', this.selectedGeo)
        this.curStatus = STATUS.NEW_GEO_TYPE
      },
      geoTypeSelected: function (geoType) {
        console.log('geoTypeSelected', geoType)
        this.selectedGeo.geoType = geoType
        this.curStatus = STATUS.NEW_EDIT_NAME
      },
      clickMap: async function (evt) {
        this.cancelMoveGeo()
        await GeoService.moveGeo(this.selectedGeo.id, evt.latlng.lat, evt.latlng.lng, this.moveChildren)
        const movedGeo = await GeoService.getGeoById(this.selectedGeo.id)
        this.$emit('move-geo-done', movedGeo)
      },
      moveGeo: function () {
        const map = document.getElementById('leafletMap')
        map.style.cursor = 'crosshair'
        this.leafletMap.on('click', this.clickMap)
        this.curStatus = STATUS.MOVING
      },
      cancelMoveGeo: function () {
        const map = document.getElementById('leafletMap')
        map.style.cursor = 'default'
        this.leafletMap.off('click', this.clickMap)
        this.curStatus = STATUS.SELECTED
      },
      cancelPositionGeo: function () {
        const map = document.getElementById('leafletMap')
        map.style.cursor = 'default'
        this.leafletMap.off('click', this.addGeo)
      },
      renameGeo: function () {
        this.curStatus = STATUS.EDIT_NAME
      },
      removeGeo: async function () {
        if (!window.confirm(`Are you sure you want to delete this geo element?`)) return
        try {
          await GeoService.removeGeo(this.selectedGeo.id)
          this.$emit('remove-geo-done', this.selectedGeo.id)
        } catch (err) {
          console.error(err)
        }
      },
      onEditingDone: async function () {
        let editedGeo
        if (this.curStatus === STATUS.NEW_EDIT_NAME) {
          editedGeo = await GeoService.createGeo(this.selectedGeo)
        } else {
          editedGeo = await GeoService.getGeoById(this.selectedGeo.id)
        }
        this.curStatus = STATUS.SELECTED
        this.$emit('editing-done', editedGeo)
      },
      onEditingCancelled: function () {
        if (this.curStatus === STATUS.EDIT_NAME) {
          this.curStatus = STATUS.SELECTED
        } else {
          this.closePanel()
        }
      },
      closePanel: function () {
        if (this.curStatus === STATUS.MOVING) {
          this.cancelMoveGeo()
        }
        if (this.curStatus === STATUS.NEW_POSITION) {
          this.cancelPositionGeo()
        }
        this.curStatus = STATUS.SELECTED
        this.$emit('editing-cancelled')
      }
    },
    computed: {
      geoTranslation: function () {
        if (this.selectedGeo === null) {
          return ''
        }
        const translation = TranslationService.getTranslated(this.selectedGeo.nameTranslation, this.global.locale)
        return (translation) ? translation : '[No translation]'
      },
      showPanel: function () {
        return (this.selectedGeo !== null)
      },
      isNewGeo: function () {
        return (this.selectedGeo && this.selectedGeo.id === null)
      },
      geoNeedsLocation: function () {
        return (this.selectedGeo && (this.selectedGeo.latitude === null || this.selectedGeo.longitude === null))
      }
    },
    components: {
      Photo,
      TranslationTextField,
      GeoTypeSelector
    }
  }
</script>

<style scoped>

</style>
