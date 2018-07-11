<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 md3>
        <geo-search v-on:returned-geo-results="returnedGeoResults"></geo-search>
      </v-flex>
      <v-flex id="mapContainer" xs12 md9>
        <div id="leafletMap"></div>
        <pre>
          {{this.geoResults}}
        </pre>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import GeoSearch from './GeoSearch'
  import TranslationService from '@/services/TranslationService'
  import L from 'leaflet'
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
        minZoom: undefined
      }
    },
    mounted () {
      this.setUpMap()
      this.addMarkers()
      this.centerMap()
    },
    computed: {
    },
    methods: {
      setUpMap: function () {
        let padding = 16
        let mapHeight = (window.innerHeight - document.getElementsByTagName('nav').item(0).offsetHeight - (padding * 2)) + 'px'
        console.log('mapHeight', mapHeight)
        document.getElementById('leafletMap').style.height = mapHeight
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
        // TODO: track and remove existing markers
        this.minZoom = undefined
        this.geoResults.forEach((geo) => {
          console.log(geo)
          if (geo.geo_type.zoom_level !== null) {
            this.minZoom = (this.minZoom === undefined) ? Number(geo.geo_type.zoom_level) : Math.min(this.minZoom, Number(geo.geo_type.zoom_level))
          }
          let markerCoords = [geo.latitude, geo.longitude]
          let marker = L.marker(markerCoords).addTo(this.trellisMap)
          let translation = TranslationService.getTranslated(geo.name_translation, this.global.locale)
          marker.bindPopup(translation).openPopup()
          this.markers.push(markerCoords)
        })
      },
      centerMap: function () {
        if (this.markers.length === 0) return
        let bounds = L.latLngBounds(this.markers)
        console.log('bounds', bounds)
        let zoomLevel = (this.minZoom === undefined) ? this.trellisMap.getBoundsZoom(bounds) : Math.min(this.trellisMap.getBoundsZoom(bounds), this.minZoom)
        console.log('zoomLevel', zoomLevel)
        this.trellisMap.setZoom(zoomLevel)
        this.trellisMap.panInsideBounds(bounds)
      }
    },
    components: {
      GeoSearch
    }
  }
</script>

<style lang="sass" scoped>
  @import "../../../node_modules/leaflet/dist/leaflet.css"

  #leafletMap
    height: 400px /* Temporary height, replaced by actual container height via javascript */
    width: 100%
</style>
