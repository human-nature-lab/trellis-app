<template>
  <v-flex v-show="showPanel">
    <v-card>
      <v-card-title>
        <translation-text-field
          v-if="editName"
          :translation="selectedGeo.nameTranslation"
          v-on:editing-done="onEditingDone">
        </translation-text-field>
        <div slot="header" v-if="!editName && !moving"><h2>{{ geoTranslation }}</h2></div>
        <div slot="header" v-if="moving">
          <h2>Moving {{ geoTranslation }}...</h2>
          <p>Click on the map where you want to move this geo element.</p>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-switch v-if="moving" label="Move child elements to the same position" v-model="moveChildren"></v-switch>
        <v-btn flat v-if="!editName && !moving" @click="moveGeo">Move <v-icon right>my_location</v-icon></v-btn>
        <v-btn flat v-if="!editName && !moving" @click="renameGeo">Rename <v-icon right>edit</v-icon></v-btn>
        <v-btn flat v-if="!editName && !moving" @click="removeGeo">Delete <v-icon right>delete</v-icon></v-btn>
        <v-btn flat v-if="moving" @click="cancelMoveGeo">Cancel</v-btn>
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
        editName: false,
        moving: false,
        moveChildren: false
      }
    },
    methods: {
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
        this.moving = true
      },
      cancelMoveGeo: function () {
        const map = document.getElementById('leafletMap')
        map.style.cursor = 'default'
        this.moving = false
        this.leafletMap.off('click', this.clickMap)
      },
      renameGeo: function () {
        this.editName = true
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
        this.editName = false
        const editedGeo = await GeoService.getGeoById(this.selectedGeo.id)
        this.$emit('editing-done', editedGeo)
      }
    },
    computed: {
      geoTranslation: function () {
        if (this.selectedGeo === null) {
          return ''
        }
        return TranslationService.getTranslated(this.selectedGeo.nameTranslation, this.global.locale)
      },
      showPanel: function () {
        return (this.selectedGeo !== null)
      }
    },
    components: {
      Photo,
      TranslationTextField
    }
  }
</script>

<style scoped>

</style>
