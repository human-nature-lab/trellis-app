<template>
  <v-layout
    column
    fill-height>
    <v-flex
      fill-height
      ref="mapContainer"
      id="leafletMap"
      style="position: relative;">
    </v-flex>
    <div>
      <debug name="Geo results">
          <pre>
            {{this.geoResults}}
          </pre>
      </debug>
    </div>
    <v-navigation-drawer
      :disable-resize-watcher="true"
      v-model="global.searchDrawer.open"
      fixed
      right
      app>
      <v-list dense>
        <v-list-tile class="grey lighten-4">
          <v-list-tile-action @click="global.searchDrawer.open = false" class="text-right">
            <v-icon>arrow_forward</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-flex>
          <geo-search v-on:returned-geo-results="returnedGeoResults"></geo-search>
        </v-flex>
      </v-list>
    </v-navigation-drawer>
  </v-layout>
</template>

<script>
  /* global L */
  import GeoSearch from './GeoSearch'
  import TranslationService from '@/services/TranslationService'
  import 'leaflet'
  // import 'leaflet.label'
  import Vue from 'vue'
  import global from '../../static/singleton'
  export default {
    name: 'geo-search-with-map',
    props: {
      visibleGeoIds: {
        type: Array,
        default: () => []
      }
    },
    head: {
      title: {
        inner: 'Geo Search'
      }
    },
    data: function () {
      return {
        geoResults: [],
        trellisMap: undefined,
        markers: [],
        markerPositions: [],
        minZoom: undefined
      }
    },
    mounted () {
      this.setUpSearch()
      this.setUpMap()
      this.addMarkers()
      this.centerMap()
    },
    computed: {
    },
    methods: {
      setUpSearch: function () {
        let ComponentClass = Vue.extend(GeoSearch)
        let instance = new ComponentClass()
        global.searchDrawer.component = instance
      },
      setUpMap: function () {
        let padding = 16
        // let mapHeight = (window.innerHeight - document.getElementsByTagName('nav').item(0).offsetHeight - (padding * 2)) + 'px'
        let mapHeight = this.$refs.mapContainer.clientHeight - (padding * 2)
        console.log('mapHeight', mapHeight)
        // this.$refs.leafletMap.style.height = mapHeight
        this.trellisMap = L.map('leafletMap').setView([0.0, 0.0], 1)
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        })
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken: '***REMOVED***'
        }).addTo(this.trellisMap)
      },
      returnedGeoResults: function (results) {
        this.geoResults = results
        this.addMarkers()
        this.centerMap()
      },
      addMarkers: function () {
        let defaultIcon = L.icon({
          iconUrl: '../../static/img/map_icons/green_dot.png',
          iconSize: [10, 10],
          iconAnchor: [4, 4],
          popupAnchor: [4, 4],
          labelAnchor: [1, 0]
        })
        this.markers.forEach((marker) => {
          this.trellisMap.removeLayer(marker)
        })
        this.markers = []
        this.markerPositions = []
        this.minZoom = undefined
        this.geoResults.forEach((geo) => {
          console.log(geo)
          if (geo.geo_type && geo.geo_type.zoom_level != null) {
            this.minZoom = (this.minZoom === undefined) ? Number(geo.geo_type.zoom_level) : Math.min(this.minZoom, Number(geo.geo_type.zoom_level))
          }
          let markerCoords = [geo.latitude, geo.longitude]
          let marker = L.marker(markerCoords, {icon: defaultIcon})
          let translation = TranslationService.getTranslated(geo.name_translation, this.global.locale)
          // marker.bindLabel(translation, {noHide: true, direction: 'right'})
          marker.bindTooltip(translation, {permanent: true, direction: 'right'})
          console.log('marker', marker)
          marker.addTo(this.trellisMap)
          this.markers.push(marker)
          this.markerPositions.push(markerCoords)
        })
      },
      centerMap: function () {
        if (this.markerPositions.length === 0) return
        this.trellisMap.fitBounds(L.latLngBounds(this.markerPositions))
        /*
        let bounds = L.latLngBounds(this.markerPositions)
        console.log('bounds', bounds)
        let zoomLevel = (this.minZoom === undefined) ? this.trellisMap.getBoundsZoom(bounds) : Math.min(this.trellisMap.getBoundsZoom(bounds), this.minZoom)
        console.log('zoomLevel', zoomLevel)
        this.trellisMap.setZoom(zoomLevel)
        this.trellisMap.panInsideBounds(bounds)
        */
      }
    },
    components: {
      GeoSearch
    }
  }
</script>

<style lang="sass" scoped>
  @import "../../../node_modules/leaflet/dist/leaflet.css"
  /*@import "../../../node_modules/leaflet.label/dist/leaflet.label.css"*/

  #leafletMap
    height: 400px /* Temporary height, replaced by actual container height via javascript */
    width: 100%
  .trellis-popup
    margin: 2px 2px
</style>
