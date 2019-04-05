<template>
  <v-layout
    column
    fill-height>
    <v-snackbar
      v-model="snackbar"
      bottom
      absolute
      :timeout="2000">
      No child locations found.
      <v-btn
        icon
        flat
        @click="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
    <v-toolbar>
      <v-btn icon v-if="parentGeo !== null" @click.stop="upOneLevelDone">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title>{{ parentGeoName }}</v-toolbar-title>
    </v-toolbar>
    <v-flex
      fill-height
      ref="mapContainer"
      id="leafletMap"
      style="position: relative;">
      <v-btn
        class="floating-button"
        @click.stop="printMap"
        :dark="global.darkTheme"
        fab
        absolute
        bottom
        left>
        <v-icon style="height:auto;">print</v-icon>
      </v-btn>
      <permission :role-whitelist="['admin']">
        <v-btn
          v-if="selectedGeo === null && parentGeo !== null && parentGeo.geoType.canUserAddChild"
          class="deep-orange floating-button"
          @click.stop="addNewGeo"
          fab
          dark
          absolute
          bottom
          right>
          <v-icon style="height:auto;">add</v-icon>
        </v-btn>
      </permission>
    </v-flex>
    <div>
      <permission :role-whitelist="['admin']">
        <geo-edit-panel
          v-on:select-geo-done="selectGeoDone"
          v-on:up-one-level-done="upOneLevelDone"
          v-on:editing-done="editingDone"
          v-on:remove-geo-done="removeGeoDone"
          v-on:move-geo-done="moveGeoDone"
          v-on:position-geo-done="positionGeoDone"
          v-on:editing-cancelled="editingCancelled"
          :selected-geo="selectedGeo"
          :leaflet-map="trellisMap"></geo-edit-panel>
      </permission>
    </div>
  </v-layout>
</template>

<script>
  /* global L */
  import 'leaflet'
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import DocsFiles from '../documentation/DocsFiles'
  import GeoService from '../../services/geo/GeoService'
  import GeoSearch from './GeoSearch'
  import TranslationService from '../../services/TranslationService'
  import global from '../../static/singleton'
  import createGraph from 'ngraph.graph'
  import forceDirectedLayout from 'ngraph.forcelayout'
  import GeoEditPanel from './GeoEditPanel.vue'
  import Permission from '../Permission'
  import StudyService from '../../services/study/StudyService'
  import config from '../../config'

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
    mixins: [DocsLinkMixin(DocsFiles.locations.map)],
    props: {
      visibleGeoIds: {
        type: Array,
        default: () => []
      }
    },
    data: function () {
      return {
        alwaysReposition: true,
        global: global,
        parentGeo: null,
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
        minZoom: undefined,
        selectedGeo: null,
        snackbar: false,
        layout: null,
        graph: null
      }
    },
    async created () {
      let curGeo = this.$router.currentRoute.params.geoId ? await GeoService.getGeoById(this.$router.currentRoute.params.geoId) : null
      this.selectGeo(curGeo)
    },
    mounted () {
      this.setUpMap()
    },
    beforeDestroy () {
      // Removing these event listeners before destroying the component prevents an out of memory crash
      this.trellisMap.off('zoomend resize')
    },
    methods: {
      selectGeo: async function (geo) {
        const geoId = (geo && geo.id) ? geo.id : null
        const geoResults = await GeoService.getGeosByParentId(geoId)
        if (geoResults.length > 0) {
          this.parentGeo = geo
          this.geoResults = geoResults
          this.displayResults(this.geoResults)
        } else {
          this.snackbar = true
        }
      },
      setUpMap: function () {
        this.trellisMap = L.map('leafletMap').setView([0.0, 0.0], 1)
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        })
        L.tileLayer(config.mapTileLayer.url, {
          attribution: config.mapTileLayer.attribution,
          maxZoom: config.mapTileLayer.maxZoom,
          id: config.mapTileLayer.id,
          accessToken: config.mapTileLayer.accessToken,
          style: config.mapTileLayer.style
        }).addTo(this.trellisMap)
        this.labelMarkerLayer = L.layerGroup().addTo(this.trellisMap)
        this.trellisMap.on('zoomend resize', () => {
          this.repositionMarkers()
        })
      },
      displayResults: function (results) {
        this.geoResults = results
        this.clearMarkers()
        this.addMarkers(results)
        this.centerMap()
        this.repositionMarkers()
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
      upOneLevelDone: async function () {
        const parentGeoId = (this.parentGeo) ? this.parentGeo.parentId : null
        const parentGeo = (parentGeoId) ? await GeoService.getGeoById(parentGeoId) : null
        this.selectedGeo = null
        this.selectGeo(parentGeo)
      },
      selectGeoDone: function (newParentGeo) {
        this.selectedGeo = null
        this.selectGeo(newParentGeo)
      },
      editingDone: function (editedGeo) {
        this.selectedGeo = null
        for (let i = 0; i < this.geoResults.length; i++) {
          let geo = this.geoResults[i]
          if (geo.id === editedGeo.id) {
            this.geoResults.splice(i, 1, editedGeo)
          }
        }
        this.displayResults(this.geoResults)
      },
      addNewGeo: async function () {
        const study = await StudyService.getCurrentStudy()
        const parentGeoId = (this.parentGeo === null) ? null : this.parentGeo.id
        this.selectedGeo = GeoService.createNewGeo(parentGeoId, study.locales)
      },
      printMap: function () {
        this.global.menuDrawer.open = false
        this.global.printMode = !this.global.printMode
      },
      removeGeoDone: function (removedGeoId) {
        this.selectedGeo = null
        for (let i = 0; i < this.geoResults.length; i++) {
          let geo = this.geoResults[i]
          if (geo.id === removedGeoId) {
            this.geoResults.splice(i, 1)
          }
        }
        this.displayResults(this.geoResults)
      },
      positionGeoDone: function (positionedGeo) {
        this.geoResults.push(positionedGeo)
        this.displayResults(this.geoResults)
      },
      moveGeoDone: function (movedGeo) {
        this.selectedGeo = null
        for (let i = 0; i < this.geoResults.length; i++) {
          let geo = this.geoResults[i]
          if (geo.id === movedGeo.id) {
            this.geoResults.splice(i, 1, movedGeo)
          }
        }
        this.displayResults(this.geoResults)
      },
      editingCancelled: function () {
        // Remove geo elements with null IDs
        let removed = false
        for (let i = 0; i < this.geoResults.length; i++) {
          let geo = this.geoResults[i]
          if (geo.id === null) {
            removed = true
            this.geoResults.splice(i, 1)
          }
        }
        if (removed) {
          this.displayResults(this.geoResults)
        }
        this.selectedGeo = null
      },
      addMarkers: async function (geoResults) {
        let tooltipsToDisplay = geoResults.length
        return new Promise((resolve) => {
          geoResults.forEach((geo) => {
            let latitude = (geo.latitude) ? geo.latitude : 0
            let longitude = (geo.longitude) ? geo.longitude : 0
            let markerCoords = [latitude, longitude]
            this.markerPositions.push(markerCoords)
            let geoMarker = L.marker(markerCoords, {icon: defaultIcon, interactive: false})
            this.geoMarkers.push(geoMarker)
            let tooltipMarker = L.marker(markerCoords, {icon: hiddenIcon, interactive: false})
            let translation = TranslationService.getTranslated(geo.nameTranslation, this.global.locale)
            tooltipMarker.geoName = (translation) ? translation : '[No translation]'
            tooltipMarker.geoId = geo.id
            tooltipMarker.geo = geo
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
        this.graph = createGraph()
        let bounds = this.trellisMap.getBounds()
        this.layout = forceDirectedLayout(this.graph)
        for (let i = 0; i < this.tooltipMarkers.length; i++) {
          let marker = this.tooltipMarkers[i]
          // Only reposition visible markers
          // TODO: check within bounds and a generous margin, ticket #150
          if (this.alwaysReposition || bounds.contains(marker.origin._latlng)) {
            let labelId = `label_${i}`
            let markerId = `marker_${i}`
            let markerNode = this.graph.addNode(markerId)
            let pos = this.latLngToPos(marker.origin._latlng.lat, marker.origin._latlng.lng, bounds)
            this.graph.addNode(labelId, marker)
            this.graph.addLink(labelId, markerId)
            this.layout.pinNode(markerNode, true)
            let x = pos[0]
            let y = pos[1]
            this.layout.setNodePosition(labelId, x, y)
            this.layout.setNodePosition(markerId, x, y)
          }
        }
        for (let i = 0; i < ITERATIONS; i++) {
          this.layout.step()
        }
        function selectGeo (vm) {
          return function () {
            vm.selectedGeo = this.geo
          }
        }
        this.graph.forEachNode((node) => {
          if (node.data) {
            let pos = this.layout.getNodePosition(node.id)
            let latLng = this.posToLatLng(pos, bounds)
            let markerPoint = node.data.origin._latlng
            let labelPoint = L.latLng(latLng[0], latLng[1])
            node.data.setLatLng(labelPoint)
            node.data.unbindTooltip()
            let tooltip = node.data.bindTooltip(node.data.geoName, {interactive: true, permanent: true, direction: this.getTooltipDirection(node.data.origin._latlng, labelPoint)})
            tooltip.on('click', selectGeo(this))
            this.tooltips.push(tooltip)
            let pathCoords = [
              markerPoint,
              labelPoint
            ]
            let path = L.polyline(pathCoords, {color: '#333', weight: 1, interactive: false})
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
    computed: {
      parentGeoName: function () {
        if (this.parentGeo === null) {
          return this.$t('locations')
        }
        const translation = TranslationService.getTranslated(this.parentGeo.nameTranslation, this.global.locale)
        return (translation) ? translation : '[No translation]'
      }
    },
    components: {
      GeoEditPanel,
      GeoSearch,
      Permission
    }
  }
</script>

<style lang="sass">
  @import "../../../node_modules/leaflet/dist/leaflet.css"

  @media print
    .floating-button
      display: none

  .print-mode
    .toolbar
      display: none
    .leaflet-control-container
      display: none
    .progress-linear
      display: none
    .content
      padding: 0 0 0 !important
      width: 8.5in
      height: 11in
      position: absolute
      top: 0
      left: 0

  .snack
    z-index: 3000 !important
  .floating-button
    z-index: 3000 !important
    margin-bottom: 50px
  #leafletMap
    height: 400px /* Temporary height, replaced by actual container height via javascript */
    width: 100%
  .trellis-popup
    margin: 2px 2px
  .leaflet-tooltip
    padding: 0px !important
</style>
