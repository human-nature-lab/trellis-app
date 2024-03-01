<script setup lang="ts">
import L from 'leaflet'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DocsFiles from '@/components/documentation/DocsFiles'
import GeoService from '@/services/geo'
import TranslationService from '@/services/TranslationService'
import global from '@/static/singleton'
import createGraph from 'ngraph.graph'
import forceDirectedLayout from 'ngraph.forcelayout'
import GeoEditPanel from '@/components/geo/GeoEditPanel.vue'
import Permission from '@/components/Permission.vue'
import StudyService from '@/services/study'
import config from '@/config'
import greenDot from '../../../static/img/map_icons/green_dot.png'
import pixel from '../../../static/img/map_icons/1px.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { computedTitle } from '@/router/history'
import { geoSearchRoute } from '@/router/util'
import { setDocsLink } from '@/helpers/docs.helper'
import { useRoute } from 'vue-router/composables'
import { i18n } from '@/i18n'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError, alert } from '@/helpers/log.helper'
import Geo from '@/entities/trellis/Geo'
import { TrellisPermission } from '@/static/permissions.base'

type tooltipData = {
  geoName: string
  geoId: string
  geo: Geo
  origin: L.Marker
}

const targetMapWidth = 600

const defaultIcon = L.icon({
  iconUrl: greenDot,
  iconSize: [10, 10],
  iconAnchor: [4, 4],
  popupAnchor: [4, 4],
  labelAnchor: [1, 0],
})

const hiddenIcon = L.icon({
  iconUrl: pixel,
  iconSize: [1, 1],
  iconAnchor: [0, 0],
  popupAnchor: [0, 0],
  labelAnchor: [0, 0],
})

const ITERATIONS = 100

setDocsLink(DocsFiles.locations.map)

const route = useRoute()
const alwaysReposition = ref(true)
const parentGeo = ref<Geo>()
const geoResults = ref<Geo[]>([])
const trellisMap = ref<L.Map>()
const labelMarkerLayer = ref<L.LayerGroup>()
const tooltipMarkers = ref<L.Marker<tooltipData>[]>([])
const geoMarkers = ref<L.Marker[]>([])
const paths = ref<L.Polyline[]>([])
const tooltips = ref<L.Tooltip[]>([])
const markerPositions = ref<[number, number][]>()
const selectedGeo = ref<Geo>()
const layout = ref(null)
const graph = ref(null)
const isLoading = ref(false)
const showContextMenu = ref(false)

const parentGeoName = computed(() => {
  if (!parentGeo.value) {
    return i18n.t('locations')
  }
  const translation = TranslationService.getTranslated(parentGeo.value.nameTranslation, global.locale)
  return translation || '[No translation]'
})

computedTitle('GeoSearchWithMap', () => {
  if (parentGeoName) {
    return { key: 'location_search_map_in', args: [parentGeoName] }
  }
  return { key: 'location_search_map' }
})

onBeforeUnmount(() => {
  if (trellisMap.value) {
    trellisMap.value.off('zoomend resize')
    trellisMap.value.off('contextmenu')
  }
})

function clearPaths () {
  paths.value.forEach((path) => {
    trellisMap.value.removeLayer(path)
  })
  paths.value = []
}

function clearTooltips () {
  tooltipMarkers.value.forEach((tooltip) => {
    tooltip.remove()
  })
  tooltipMarkers.value = []
}

async function addNewGeo () {
  try {
    const study = await StudyService.getCurrentStudy()
    const parentGeoId = (parentGeo.value === null) ? null : parentGeo.value.id
    selectedGeo.value = GeoService.createNewGeo(parentGeoId, study.locales)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  }
}

function printMap () {
  global.menuDrawer.open = false
  global.printMode = !global.printMode
}

async function addMarkers (geoResults: Geo[]) {
  let tooltipsToDisplay = geoResults.length
  return new Promise((resolve) => {
    geoResults.forEach((geo) => {
      const markerCoords: [number, number] = [geo.latitude || 0, geo.longitude || 0]
      markerPositions.value.push(markerCoords)
      const geoMarker = L.marker(markerCoords, { icon: defaultIcon, interactive: false })
      geoMarkers.value.push(geoMarker)
      const tooltipMarker: L.Marker<tooltipData> = L.marker(markerCoords, { icon: hiddenIcon, interactive: false })
      const translation = TranslationService.getAny(geo.nameTranslation, global.locale)
      if (!tooltipMarker.feature) {
        tooltipMarker.feature = {} as tooltipData
      }
      tooltipMarker.feature.properties = {
        geoName: translation || '[No translation]',
        geoId: geo.id,
        geo: geo,
        origin: geoMarker,
      }
      tooltipMarkers.value.push(tooltipMarker)
      tooltipMarker.on('add', () => {
        tooltipsToDisplay--
        if (tooltipsToDisplay === 0) {
          resolve()
        }
      })
      geoMarker.addTo(trellisMap.value)
      labelMarkerLayer.value.addLayer(tooltipMarker)
    })
  })
}

function latLngToPos (lat: number, lng: number, bounds: L.LatLngBounds) {
  const sw = bounds.getSouthWest()
  const width = Math.abs(bounds.getNorthEast().lat - sw.lat)
  const scale = targetMapWidth / width
  const x = (lat - sw.lat) * scale
  const y = (lng - sw.lng) * scale
  return [x, y]
}

function posToLatLng (pos: {x: number, y: number}, bounds: L.LatLngBounds) {
  const sw = bounds.getSouthWest()
  const width = Math.abs(bounds.getNorthEast().lat - sw.lat)
  const scale = targetMapWidth / width
  const lat = pos.x / scale + sw.lat
  const lng = pos.y / scale + sw.lng
  return [lat, lng]
}

function getTooltipDirection (origin: L.LatLng, latLng: L.LatLng) {
  const diffLat = origin.lat - latLng.lat
  const diffLng = origin.lng - latLng.lng
  if (Math.abs(diffLat) > Math.abs(diffLng)) {
    return (diffLat < 0) ? 'top' : 'bottom'
  } else {
    return (diffLng < 0) ? 'right' : 'left'
  }
}

function repositionMarkers () {
  console.log('repositionMarkers')
  clearPaths()
  graph.value = createGraph()
  const bounds = trellisMap.value.getBounds()
  layout.value = forceDirectedLayout(graph.value)
  for (let i = 0; i < tooltipMarkers.value.length; i++) {
    const marker = tooltipMarkers.value[i]
    // Only reposition visible markers
    // TODO: check within bounds and a generous margin, ticket #150
    const ll = marker.getLatLng()
    if (alwaysReposition.value || bounds.contains(ll)) {
      const labelId = `label_${i}`
      const markerId = `marker_${i}`
      const markerNode = graph.value.addNode(markerId)
      const pos = latLngToPos(ll.lat, ll.lng, bounds)
      graph.value.addNode(labelId, marker)
      graph.value.addLink(labelId, markerId)
      layout.value.pinNode(markerNode, true)
      const x = pos[0]
      const y = pos[1]
      layout.value.setNodePosition(labelId, x, y)
      layout.value.setNodePosition(markerId, x, y)
    }
  }
  for (let i = 0; i < ITERATIONS; i++) {
    layout.value.step()
  }
  graph.value.forEachNode((node: { id: string, data: L.Marker<tooltipData> }) => {
    if (node.data) {
      const pos = layout.value.getNodePosition(node.id)
      const latLng = posToLatLng(pos, bounds)
      const markerData = node.data.feature.properties
      const markerPoint = markerData.origin.getLatLng()
      const labelPoint = L.latLng(latLng[0], latLng[1])
      node.data.setLatLng(labelPoint)
      node.data.unbindTooltip()
      const tooltip = node.data.bindTooltip(markerData.geoName, {
        interactive: true,
        permanent: true,
        direction: getTooltipDirection(markerPoint, labelPoint),
      })
      tooltip.on('click', () => {
        console.log('TODO: select the geo')
      })
      tooltips.value.push(tooltip)
      const pathCoords = [
        markerPoint,
        labelPoint,
      ]
      const path = L.polyline(pathCoords, { color: '#333', weight: 1, interactive: false })
      labelMarkerLayer.value.addLayer(path)
      paths.value.push(path)
    }
  })
}

function setUpMap () {
  trellisMap.value = L.map('leafletMap').setView([0.0, 0.0], 1)
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
  L.tileLayer(config.mapTileLayer.url, {
    attribution: config.mapTileLayer.attribution,
    maxZoom: config.mapTileLayer.maxZoom,
    id: config.mapTileLayer.id,
    accessToken: config.mapTileLayer.accessToken,
    style: config.mapTileLayer.style,
  }).addTo(trellisMap.value)
  labelMarkerLayer.value = L.layerGroup().addTo(trellisMap.value)
  trellisMap.value.on('zoomend resize', () => {
    repositionMarkers()
  })
  trellisMap.value.on('contextmenu', e => {
    showContextMenu.value = true
  })
}

function clearMarkers () {
  clearPaths()
  clearTooltips()
  tooltipMarkers.value.forEach((marker) => {
    trellisMap.value.removeLayer(marker)
  })
  geoMarkers.value.forEach((marker) => {
    trellisMap.value.removeLayer(marker)
  })
  tooltipMarkers.value = []
  geoMarkers.value = []
  markerPositions.value = []
}

function centerMap () {
  if (markerPositions.value.length > 0) {
    const bounds = L.latLngBounds(markerPositions.value)
    trellisMap.value.fitBounds(bounds)
  }
}

function displayResults () {
  console.log('displayResults')
  clearMarkers()
  addMarkers(geoResults.value)
  centerMap()
  repositionMarkers()
}

function editingDone (editedGeo: Geo) {
  selectedGeo.value = null
  for (let i = 0; i < geoResults.value.length; i++) {
    const geo = geoResults.value[i]
    if (geo.id === editedGeo.id) {
      geoResults.value.splice(i, 1, editedGeo)
    }
  }
  displayResults()
}

function removeGeoDone (removedGeoId: string) {
  selectedGeo.value = null
  for (let i = 0; i < geoResults.value.length; i++) {
    const geo = geoResults.value[i]
    if (geo.id === removedGeoId) {
      geoResults.value.splice(i, 1)
    }
  }
  displayResults()
}

function positionGeoDone (positionedGeo: Geo) {
  geoResults.value.push(positionedGeo)
  displayResults()
}

function moveGeoDone (movedGeo: Geo) {
  selectedGeo.value = null
  for (let i = 0; i < geoResults.value.length; i++) {
    const geo = geoResults.value[i]
    if (geo.id === movedGeo.id) {
      geoResults.value.splice(i, 1, movedGeo)
    }
  }
  displayResults()
}

async function selectGeo (geo: Geo) {
  console.log('selectGeo', geo)
  try {
    isLoading.value = true
    const res = await GeoService.getGeosByParentId(global.study.id, geo.id)
    if (res.length > 0) {
      parentGeo.value = geo
      geoResults.value = res
      displayResults()
    } else {
      alert('default', i18n.t('no_locations_found'))
    }
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, 'Unable to load child locations')
    }
  } finally {
    isLoading.value = false
  }
}

async function upOneLevelDone () {
  try {
    const parentGeoId = (parentGeo.value) ? parentGeo.value.parentId : null
    const pGeo = (parentGeoId) ? await GeoService.getGeoById(parentGeoId) : null
    selectedGeo.value = null
    selectGeo(pGeo)
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  }
}

function selectGeoDone (newParentGeo: Geo) {
  selectedGeo.value = null
  selectGeo(newParentGeo)
}

function editingCancelled () {
  // Remove geo elements with null IDs
  let removed = false
  for (let i = 0; i < geoResults.value.length; i++) {
    const geo = geoResults.value[i]
    if (geo.id === null) {
      removed = true
      geoResults.value.splice(i, 1)
    }
  }
  if (removed) {
    displayResults()
  }
  selectedGeo.value = null
}

watch(() => route.params.geoId, async (geoId) => {
  if (geoId) {
    try {
      isLoading.value = true
      const curGeo = await GeoService.getGeoById(geoId)
      selectGeo(curGeo)
    } catch (err) {
      if (isNotAuthError(err)) {
        logError(err, i18n.t('no_locations_found'))
      }
    } finally {
      isLoading.value = false
    }
  } else {
    selectGeo(null)
  }
}, { immediate: true })

onMounted(() => {
  setUpMap()
})

// export default {
//   name: 'geo-search-with-map',
//   mixins: [DocsLinkMixin(DocsFiles.locations.map)],
//   props: {
//     visibleGeoIds: {
//       type: Array,
//       default: () => []
//     }
//   },
//   data () {
//     return {
//       alwaysReposition: true,
//       global: global,
//       parentGeo: null,
//       geoResults: [],
//       trellisMap: undefined,
//       canvas: undefined,
//       markerLayer: undefined,
//       labelMarkerLayer: undefined,
//       tooltipMarkers: [],
//       geoMarkers: [],
//       paths: [],
//       tooltips: [],
//       markerPositions: [],
//       minZoom: undefined,
//       selectedGeo: null,
//       layout: null,
//       graph: null,
//       isLoading: false
//     }
//   },
//   async created () {
//     computedTitle('GeoSearchWithMap', () => {
//       if (this.parentGeoName) {
//         return { key: 'location_search_map_in', args: [this.parentGeoName] }
//       }
//       return { key: 'location_search_map' }
//     })
//     try {
//       this.isLoading = true
//       let curGeo = this.$router.currentRoute.params.geoId ? await GeoService.getGeoById(this.$router.currentRoute.params.geoId) : null
//       this.selectGeo(curGeo)
//     } catch (err) {
//       if (this.isNotAuthError(err)) {
//         this.logError(err, this.$t('no_locations_found'))
//       }
//     }
//   },
//   mounted () {
//     this.setUpMap()
//   },
//   beforeDestroy () {
//     // Removing these event listeners before destroying the component prevents an out of memory crash
//     this.trellisMap.off('zoomend resize')
//   },
//   methods: {
//     geoSearchRoute,
//     async selectGeo (geo) {
//       const geoId = (geo && geo.id) ? geo.id : null
//       try {
//         this.isLoading = true
//         const geoResults = await GeoService.getGeosByParentId(this.global.study.id, geoId)
//         if (geoResults.length > 0) {
//           this.parentGeo = geo
//           this.geoResults = geoResults
//           this.displayResults(this.geoResults)
//         } else {
//           this.alert('default', this.$t('no_locations_found'))
//         }
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err, 'Unable to load child locations')
//         }
//       } finally {
//         this.isLoading = false
//       }
//     },
//     setUpMap () {
//       this.trellisMap = L.map('leafletMap').setView([0.0, 0.0], 1)
//       delete L.Icon.Default.prototype._getIconUrl
//       L.Icon.Default.mergeOptions({
//         iconRetinaUrl: markerIcon2x,
//         iconUrl: markerIcon,
//         shadowUrl: markerShadow
//       })
//       L.tileLayer(config.mapTileLayer.url, {
//         attribution: config.mapTileLayer.attribution,
//         maxZoom: config.mapTileLayer.maxZoom,
//         id: config.mapTileLayer.id,
//         accessToken: config.mapTileLayer.accessToken,
//         style: config.mapTileLayer.style
//       }).addTo(this.trellisMap)
//       this.labelMarkerLayer = L.layerGroup().addTo(this.trellisMap)
//       this.trellisMap.on('zoomend resize', () => {
//         this.repositionMarkers()
//       })
//       this.trellisMap.on('contextmenu', (...args) => {
//         this.
//       })
//     },
//     displayResults (results) {
//       this.geoResults = results
//       this.clearMarkers()
//       this.addMarkers(results)
//       this.centerMap()
//       this.repositionMarkers()
//     },
//     clearMarkers () {
//       this.clearPaths()
//       this.clearTooltips()
//       this.tooltipMarkers.forEach((marker) => {
//         this.trellisMap.removeLayer(marker)
//       })
//       this.geoMarkers.forEach((marker) => {
//         this.trellisMap.removeLayer(marker)
//       })
//       this.tooltipMarkers = []
//       this.geoMarkers = []
//       this.markerPositions = []
//     },
//     clearPaths () {
//       this.paths.forEach((path) => {
//         this.trellisMap.removeLayer(path)
//       })
//       this.paths = []
//     },
//     clearTooltips () {
//       this.tooltipMarkers.forEach((tooltip) => {
//         tooltip.remove()
//       })
//       this.tooltipMarkers = []
//     },
//     upOneLevelDone: async function () {
//       try {
//         const parentGeoId = (this.parentGeo) ? this.parentGeo.parentId : null
//         const parentGeo = (parentGeoId) ? await GeoService.getGeoById(parentGeoId) : null
//         this.selectedGeo = null
//         this.selectGeo(parentGeo)
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err)
//         }
//       }
//     },
//     selectGeoDone (newParentGeo) {
//       this.selectedGeo = null
//       this.selectGeo(newParentGeo)
//     },
//     editingDone (editedGeo) {
//       this.selectedGeo = null
//       for (let i = 0; i < this.geoResults.length; i++) {
//         let geo = this.geoResults[i]
//         if (geo.id === editedGeo.id) {
//           this.geoResults.splice(i, 1, editedGeo)
//         }
//       }
//       this.displayResults(this.geoResults)
//     },
//     async addNewGeo () {
//       try {
//         const study = await StudyService.getCurrentStudy()
//         const parentGeoId = (this.parentGeo === null) ? null : this.parentGeo.id
//         this.selectedGeo = GeoService.createNewGeo(parentGeoId, study.locales)
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err)
//         }
//       }
//     },
//     printMap () {
//       this.global.menuDrawer.open = false
//       this.global.printMode = !this.global.printMode
//     },
//     removeGeoDone (removedGeoId) {
//       this.selectedGeo = null
//       for (let i = 0; i < this.geoResults.length; i++) {
//         let geo = this.geoResults[i]
//         if (geo.id === removedGeoId) {
//           this.geoResults.splice(i, 1)
//         }
//       }
//       this.displayResults(this.geoResults)
//     },
//     positionGeoDone (positionedGeo) {
//       this.geoResults.push(positionedGeo)
//       this.displayResults(this.geoResults)
//     },
//     moveGeoDone (movedGeo) {
//       this.selectedGeo = null
//       for (let i = 0; i < this.geoResults.length; i++) {
//         let geo = this.geoResults[i]
//         if (geo.id === movedGeo.id) {
//           this.geoResults.splice(i, 1, movedGeo)
//         }
//       }
//       this.displayResults(this.geoResults)
//     },
//     editingCancelled () {
//       // Remove geo elements with null IDs
//       let removed = false
//       for (let i = 0; i < this.geoResults.length; i++) {
//         let geo = this.geoResults[i]
//         if (geo.id === null) {
//           removed = true
//           this.geoResults.splice(i, 1)
//         }
//       }
//       if (removed) {
//         this.displayResults(this.geoResults)
//       }
//       this.selectedGeo = null
//     },
//     async addMarkers (geoResults) {
//       let tooltipsToDisplay = geoResults.length
//       return new Promise((resolve) => {
//         geoResults.forEach((geo) => {
//           const markerCoords = [geo.latitude || 0, geo.longitude || 0]
//           this.markerPositions.push(markerCoords)
//           const geoMarker = L.marker(markerCoords, {icon: defaultIcon, interactive: false})
//           this.geoMarkers.push(geoMarker)
//           const tooltipMarker = L.marker(markerCoords, {icon: hiddenIcon, interactive: false})
//           const translation = TranslationService.getAny(geo.nameTranslation, this.global.locale)
//           tooltipMarker.geoName = translation || '[No translation]'
//           tooltipMarker.geoId = geo.id
//           tooltipMarker.geo = geo
//           tooltipMarker.origin = geoMarker
//           this.tooltipMarkers.push(tooltipMarker)
//           tooltipMarker.on('add', () => {
//             tooltipsToDisplay--
//             if (tooltipsToDisplay === 0) {
//               resolve()
//             }
//           })
//           geoMarker.addTo(this.trellisMap)
//           // tooltipMarker.addTo(this.trellisMap)
//           this.labelMarkerLayer.addLayer(tooltipMarker)
//         })
//       })
//     },
//     latLngToPos (lat, lng, bounds) {
//       let width = Math.abs(bounds._northEast.lat - bounds._southWest.lat)
//       let scale = targetMapWidth / width
//       let x = (lat - bounds._southWest.lat) * scale
//       let y = (lng - bounds._southWest.lng) * scale
//       return [x, y]
//     },
//     posToLatLng (pos, bounds) {
//       let width = Math.abs(bounds._northEast.lat - bounds._southWest.lat)
//       let scale = targetMapWidth / width
//       let lat = pos.x / scale + bounds._southWest.lat
//       let lng = pos.y / scale + bounds._southWest.lng
//       return [lat, lng]
//     },
//     repositionMarkers () {
//       this.clearPaths()
//       this.graph = createGraph()
//       let bounds = this.trellisMap.getBounds()
//       this.layout = forceDirectedLayout(this.graph)
//       for (let i = 0; i < this.tooltipMarkers.length; i++) {
//         let marker = this.tooltipMarkers[i]
//         // Only reposition visible markers
//         // TODO: check within bounds and a generous margin, ticket #150
//         if (this.alwaysReposition || bounds.contains(marker.origin._latlng)) {
//           let labelId = `label_${i}`
//           let markerId = `marker_${i}`
//           let markerNode = this.graph.addNode(markerId)
//           let pos = this.latLngToPos(marker.origin._latlng.lat, marker.origin._latlng.lng, bounds)
//           this.graph.addNode(labelId, marker)
//           this.graph.addLink(labelId, markerId)
//           this.layout.pinNode(markerNode, true)
//           let x = pos[0]
//           let y = pos[1]
//           this.layout.setNodePosition(labelId, x, y)
//           this.layout.setNodePosition(markerId, x, y)
//         }
//       }
//       for (let i = 0; i < ITERATIONS; i++) {
//         this.layout.step()
//       }
//       function selectGeo (vm) {
//         return function () {
//           vm.selectedGeo = this.geo
//         }
//       }
//       this.graph.forEachNode((node) => {
//         if (node.data) {
//           let pos = this.layout.getNodePosition(node.id)
//           let latLng = this.posToLatLng(pos, bounds)
//           let markerPoint = node.data.origin._latlng
//           let labelPoint = L.latLng(latLng[0], latLng[1])
//           node.data.setLatLng(labelPoint)
//           node.data.unbindTooltip()
//           let tooltip = node.data.bindTooltip(node.data.geoName, {interactive: true, permanent: true, direction: this.getTooltipDirection(node.data.origin._latlng, labelPoint)})
//           tooltip.on('click', selectGeo(this))
//           this.tooltips.push(tooltip)
//           let pathCoords = [
//             markerPoint,
//             labelPoint
//           ]
//           let path = L.polyline(pathCoords, {color: '#333', weight: 1, interactive: false})
//           this.labelMarkerLayer.addLayer(path)
//           this.paths.push(path)
//         }
//       })
//     },
//     getTooltipDirection: function (origin, latLng) {
//       let diffLat = origin.lat - latLng.lat
//       let diffLng = origin.lng - latLng.lng
//       if (Math.abs(diffLat) > Math.abs(diffLng)) {
//         return (diffLat < 0) ? 'top' : 'bottom'
//       } else {
//         return (diffLng < 0) ? 'right' : 'left'
//       }
//     },
//     findOverlappingTooltips () {
//       const tooltips = document.getElementsByClassName('leaflet-tooltip')
//       for (let i = 0; i < (tooltips.length - 1); i++) {
//         let tooltipA = tooltips[i]
//         for (let j = i + 1; j < tooltips.length; j++) {
//           let tooltipB = tooltips[j]
//           if (this.isOverlapping(tooltipA, tooltipB)) {
//             return true
//           }
//         }
//       }
//       return false
//     },
//     isOverlapping (elementA, elementB) {
//       let rectA = elementA.getBoundingClientRect()
//       let rectB = elementB.getBoundingClientRect()
//       return ! (rectA.right  < rectB.left  ||
//                 rectA.left   > rectB.right ||
//                 rectA.bottom < rectB.top   ||
//                 rectA.top    > rectB.bottom)
//     },
//     centerMap () {
//       if (this.markerPositions.length === 0) return
//       this.trellisMap.fitBounds(L.latLngBounds(this.markerPositions))
//     }
//   },
//   computed: {
//     parentGeoName () {
//       if (this.parentGeo === null) {
//         return this.$t('locations')
//       }
//       const translation = TranslationService.getTranslated(this.parentGeo.nameTranslation, this.global.locale)
//       return (translation) ? translation : '[No translation]'
//     }
//   },
//   components: {
//     GeoEditPanel,
//     GeoSearch,
//     Permission
//   }
// }
</script>

<template>
  <v-col class="geo-search-with-map d-flex flex-column flex-grow-1">
    <v-toolbar class="flex-grow-0 w-full">
      <v-btn
        v-if="parentGeo !== null"
        icon
        @click.stop="upOneLevelDone"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ parentGeoName }}</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="parentGeo"
        :to="geoSearchRoute(parentGeo.id)"
        icon
        text
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-toolbar>
    <v-col class="flex-grow-1 pa-0">
      <v-col
        ref="mapContainer"
        id="leafletMap"
      >
        <v-progress-linear
          id="loading-progress"
          v-if="isLoading"
          indeterminate
        />
        <v-btn
          class="floating-button"
          @click.stop="printMap"
          :dark="global.darkTheme"
          fab
          absolute
          bottom
          left
        >
          <v-icon style="height:auto;">
            mdi-printer
          </v-icon>
        </v-btn>
        <Permission :requires="TrellisPermission.ADD_GEO">
          <v-btn
            v-if="selectedGeo === null && parentGeo !== null && parentGeo.geoType.canUserAddChild"
            class="deep-orange floating-button"
            @click.stop="addNewGeo"
            fab
            dark
            absolute
            bottom
            right
          >
            <v-icon style="height:auto;">
              mdi-plus
            </v-icon>
          </v-btn>
        </Permission>
      </v-col>
    </v-col>

    <div class="flow-grow-0">
      <Permission :requires="TrellisPermission.EDIT_GEO">
        <GeoEditPanel
          @select-geo-done="selectGeoDone"
          @up-one-level-done="upOneLevelDone"
          @editing-done="editingDone"
          @remove-geo-done="removeGeoDone"
          @move-geo-done="moveGeoDone"
          @position-geo-done="positionGeoDone"
          @editing-cancelled="editingCancelled"
          :selected-geo="selectedGeo"
          :leaflet-map="trellisMap"
        />
      </Permission>
    </div>
  </v-col>
</template>

<style lang="sass">
  @import "../../../node_modules/leaflet/dist/leaflet.css"

  @media print
    .geo-search-with-map
      .floating-button
        display: none
      .col
        padding: 0
      .container.fill-height
        height: 100% !important
        min-height: 100vh

  .snack
    z-index: 3000 !important
  .floating-button
    z-index: 3000 !important
    margin-bottom: 50px
  #leafletMap
    z-index: 0
    height: 100%
    width: 100%
  .trellis-popup
    margin: 2px 2px
  .leaflet-tooltip
    padding: 0px !important

  #loading-progress
    position: absolute
    top: -15px
    z-index: 1000

  .edit-panel
    max-height: 200px
</style>
