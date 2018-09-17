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
      fixed
      clipped
      :disable-route-watcher="true"
      v-model="global.searchDrawer.open"
      right
      app>
      <v-list dense>
        <v-list-tile :dark="global.darkTheme">
          <v-list-tile-action @click="global.searchDrawer.open = false" class="text-right">
            <v-icon>arrow_forward</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-flex>
          <geo-search v-on:returned-geo-results="displayResults"></geo-search>
        </v-flex>
      </v-list>
    </v-navigation-drawer>
  </v-layout>
</template>

<script>
  /* global L */
  import 'leaflet'
  import GeoSearch from './GeoSearch'
  import TranslationService from '../../services/TranslationService'
  import global from '../../static/singleton'
  import createGraph from 'ngraph.graph'
  import forceDirectedLayout from 'ngraph.forcelayout'

  const targetMapWidth = 600

  const defaultIcon = L.icon({
    iconUrl: require('../../../static/img/map_icons/green_dot.png'),
    iconSize: [10, 10],
    iconAnchor: [4, 4],
    popupAnchor: [4, 4],
    labelAnchor: [1, 0]
  })

  const hiddenIcon = L.icon({
    iconUrl: require('../../../static/img/map_icons/1px.png'),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
    labelAnchor: [0, 0]
  })

  const ITERATIONS = 100

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
        global: global,
        geoResults: [],
        trellisMap: undefined,
        canvas: undefined,
        markerLayer: undefined,
        labelMarkerLayer: undefined,
        tooltipMarkers: [],
        geoMarkers: [],
        paths: [],
        tooltips: [],
        markerPositions: [],
        minZoom: undefined
      }
    },
    mounted () {
      this.setUpSearch()
      this.setUpMap()
      this.displayResults(this.geoResults)
      this.$nextTick(() => { this.global.searchDrawer.open = true })
    },
    methods: {
      setUpSearch: function () {
        global.searchDrawer.component = GeoSearch
      },
      setUpMap: function () {
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
        this.labelMarkerLayer = L.layerGroup().addTo(this.trellisMap)
        this.trellisMap.on('zoomend', () => {
          this.repositionMarkers()
        })
      },
      displayResults: async function (results) {
        this.geoResults = results
        this.clearMarkers()
        this.addMarkers(results)
        this.centerMap()
        if (this.findOverlappingTooltips()) {
          this.repositionMarkers()
        }
        this.$nextTick(() => { this.global.searchDrawer.open = true })
      },
      clearMarkers: function () {
        this.clearPaths()
        this.clearTooltips()
        this.tooltipMarkers.forEach((marker) => {
          this.trellisMap.removeLayer(marker)
        })
        this.geoMarkers.forEach((marker) => {
          this.trellisMap.removeLayer(marker)
        })
        this.tooltipMarkers = []
        this.geoMarkers = []
        this.markerPositions = []
      },
      clearPaths: function () {
        this.paths.forEach((path) => {
          this.trellisMap.removeLayer(path)
        })
        this.paths = []
      },
      clearTooltips: function () {
        this.tooltipMarkers.forEach((tooltip) => {
          tooltip.remove()
        })
        this.tooltipMarkers = []
      },
      addMarkers: async function (geoResults) {
        let tooltipsToDisplay = geoResults.length
        return new Promise((resolve) => {
          geoResults.forEach((geo) => {
            let markerCoords = [geo.latitude, geo.longitude]
            this.markerPositions.push(markerCoords)
            let geoMarker = L.marker(markerCoords, {icon: defaultIcon})
            this.geoMarkers.push(geoMarker)
            let tooltipMarker = L.marker(markerCoords, {icon: hiddenIcon})
            let translation = TranslationService.getTranslated(geo.nameTranslation, this.global.locale)
            tooltipMarker.geoName = translation
            tooltipMarker.origin = geoMarker
            this.tooltipMarkers.push(tooltipMarker)
            tooltipMarker.on('add', () => {
              tooltipsToDisplay--
              if (tooltipsToDisplay === 0) {
                resolve()
              }
            })
            geoMarker.addTo(this.trellisMap)
            // tooltipMarker.addTo(this.trellisMap)
            this.labelMarkerLayer.addLayer(tooltipMarker)
          })
        })
      },
      latLngToPos: function (lat, lng, bounds) {
        let width = Math.abs(bounds._northEast.lat - bounds._southWest.lat)
        let scale = targetMapWidth / width
        let x = (lat - bounds._southWest.lat) * scale
        let y = (lng - bounds._southWest.lng) * scale
        return [x, y]
      },
      posToLatLng: function (pos, bounds) {
        let width = Math.abs(bounds._northEast.lat - bounds._southWest.lat)
        let scale = targetMapWidth / width
        let lat = pos.x / scale + bounds._southWest.lat
        let lng = pos.y / scale + bounds._southWest.lng
        return [lat, lng]
      },
      repositionMarkers: function () {
        this.clearPaths()
        let graph = createGraph()
        let bounds = this.trellisMap.getBounds()
        let layout = forceDirectedLayout(graph)
        for (let i = 0; i < this.tooltipMarkers.length; i++) {
          let marker = this.tooltipMarkers[i]
          let labelId = `label_${i}`
          let markerId = `marker_${i}`
          let markerNode = graph.addNode(markerId)
          let pos = this.latLngToPos(marker.origin._latlng.lat, marker.origin._latlng.lng, bounds)
          graph.addNode(labelId, marker)
          graph.addLink(labelId, markerId)
          layout.pinNode(markerNode, true)
          let x = pos[0]
          let y = pos[1]
          layout.setNodePosition(labelId, x, y)
          layout.setNodePosition(markerId, x, y)
        }
        for (let i = 0; i < ITERATIONS; i++) {
          layout.step()
        }
        graph.forEachNode((node) => {
          if (node.data) {
            let pos = layout.getNodePosition(node.id)
            let latLng = this.posToLatLng(pos, bounds)
            let markerPoint = node.data.origin._latlng
            let labelPoint = L.latLng(latLng[0], latLng[1])
            node.data.setLatLng(labelPoint)
            node.data.unbindTooltip()
            let tooltip = node.data.bindTooltip(node.data.geoName, {permanent: true, direction: this.getTooltipDirection(node.data.origin._latlng, labelPoint)})
            this.tooltips.push(tooltip)
            let pathCoords = [
              markerPoint,
              labelPoint
            ]
            let path = L.polyline(pathCoords, {color: '#333', weight: 1})
            this.labelMarkerLayer.addLayer(path)
            this.paths.push(path)
          }
        })
      },
      getTooltipDirection: function (origin, latLng) {
        let diffLat = origin.lat - latLng.lat
        let diffLng = origin.lng - latLng.lng
        if (Math.abs(diffLat) > Math.abs(diffLng)) {
          return (diffLat < 0) ? 'top' : 'bottom'
        } else {
          return (diffLng < 0) ? 'right' : 'left'
        }
      },
      findOverlappingTooltips: function () {
        const tooltips = document.getElementsByClassName('leaflet-tooltip')
        for (let i = 0; i < (tooltips.length - 1); i++) {
          let tooltipA = tooltips[i]
          for (let j = i + 1; j < tooltips.length; j++) {
            let tooltipB = tooltips[j]
            if (this.isOverlapping(tooltipA, tooltipB)) {
              return true
            }
          }
        }
        return false
      },
      isOverlapping: function (elementA, elementB) {
        let rectA = elementA.getBoundingClientRect()
        let rectB = elementB.getBoundingClientRect()
        return ! (rectA.right  < rectB.left  ||
                  rectA.left   > rectB.right ||
                  rectA.bottom < rectB.top   ||
                  rectA.top    > rectB.bottom)
      },
      centerMap: function () {
        if (this.markerPositions.length === 0) return
        this.trellisMap.fitBounds(L.latLngBounds(this.markerPositions))
      }
    },
    components: {
      GeoSearch
    }
  }
</script>

<style lang="sass">
  @import "../../../node_modules/leaflet/dist/leaflet.css"

  #leafletMap
    height: 400px /* Temporary height, replaced by actual container height via javascript */
    width: 100%
  .trellis-popup
    margin: 2px 2px
  .leaflet-tooltip
    padding: 0px !important
</style>
