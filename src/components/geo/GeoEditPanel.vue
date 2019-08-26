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
        style="top: 0"
        @click="closePanel"><v-icon>clear</v-icon></v-btn>
      <v-card-title>
        <translation-text-field
          v-if="curStatus === STATUS.EDIT_NAME || curStatus === STATUS.NEW_EDIT_NAME"
          :editing="true"
          :persist="(curStatus === STATUS.EDIT_NAME)"
          :translation="selectedGeo.nameTranslation"
          @cancelled="onEditingCancelled"
          @save="onEditingDone">
        </translation-text-field>
        <div slot="header" v-if="curStatus === STATUS.NEW_POSITION">
          <h2>{{ $t('new_location') }}</h2>
          <p>{{ $t('click_on_the_map') }}</p>
        </div>
        <div slot="header" v-if="curStatus === STATUS.SELECTED"><h2>{{ geoTranslation }}</h2></div>
        <div slot="header" v-if="curStatus === STATUS.MOVING">
          <h2>{{ $t('moving') }} {{ geoTranslation }}</h2>
          <p>{{ $t('click_on_the_map') }}</p>
        </div>
      </v-card-title>
      <v-card-actions v-if="curStatus === STATUS.SELECTED">
        <v-btn large @click="selectGeo">{{ $t('view_children') }}</v-btn>
        <v-btn large @click="showGeoInfo">{{ $t('more_info') }}</v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-spacer></v-spacer>
        <geo-type-selector
          v-if="curStatus === STATUS.NEW_GEO_TYPE"
          :show-user-addable="true"
          v-on:geo-type-selected="geoTypeSelected">
        </geo-type-selector>
        <span v-if="curStatus === STATUS.SELECTED">
          <v-btn small flat @click="moveGeo">{{ $t('move') }} <v-icon right>my_location</v-icon></v-btn>
          <v-btn small flat @click="renameGeo">{{ $t('rename') }} <v-icon right>edit</v-icon></v-btn>
          <v-btn small flat @click="removeGeo">{{ $t('delete') }} <v-icon right>delete</v-icon></v-btn>
        </span>
        <v-switch v-if="curStatus === STATUS.MOVING" :label="$t('move_child_elements')" v-model="moveChildren"></v-switch>
        <v-btn v-if="curStatus === STATUS.MOVING" flat @click="cancelMoveGeo">{{ $t('cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
  import Geo from '../../entities/trellis/Geo'
  import Photo from '../photo/Photo.vue'
  import TranslationService from '../../services/TranslationService'
  import GeoService from '../../services/geo/GeoService'
  import global from '../../static/singleton'
  import TranslationTextField from '../TranslationTextField.vue'
  import GeoTypeSelector from './GeoTypeSelector.vue'
  import index from '../../router'

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
      showGeoInfo () {
        index.push({
          name: 'Geo',
          params: {
            geoId: this.selectedGeo.id
          }
        })
      },
      positionGeo: function (evt) {
        this.selectedGeo.latitude = evt.latlng.lat
        this.selectedGeo.longitude = evt.latlng.lng
        this.cancelPositionGeo()
        this.$emit('position-geo-done', this.selectedGeo)
        this.curStatus = STATUS.NEW_GEO_TYPE
      },
      geoTypeSelected: function (geoType) {
        this.selectedGeo.geoType = geoType
        this.curStatus = STATUS.NEW_EDIT_NAME
      },
      clickMap: async function (evt) {
        try {
          this.cancelMoveGeo()
          await GeoService.moveGeo(this.selectedGeo.id, evt.latlng.lat, evt.latlng.lng, this.moveChildren)
          const movedGeo = await GeoService.getGeoById(this.selectedGeo.id)
          this.$emit('move-geo-done', movedGeo)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      selectGeo: function () {
        this.$emit('select-geo-done', this.selectedGeo)
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
        if (!window.confirm(this.$t('confirm_delete_geo'))) return
        try {
          await GeoService.removeGeo(this.selectedGeo.id)
          this.$emit('remove-geo-done', this.selectedGeo.id)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, `Unable to remove geo: ${this.selectedGeo.id}`)
          }
        }
      },
      onEditingDone: async function () {
        let editedGeo
        try {
          if (this.curStatus === STATUS.NEW_EDIT_NAME) {
            editedGeo = await GeoService.createGeo(this.selectedGeo)
          } else {
            editedGeo = await GeoService.getGeoById(this.selectedGeo.id)
          }
          this.curStatus = STATUS.SELECTED
          this.$emit('editing-done', editedGeo)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
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
        return (translation) ? translation : `[${this.$t('no_translation')}]`
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
