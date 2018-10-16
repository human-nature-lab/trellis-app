<template>
  <div>
    <v-tabs>
      <v-tab key="Search"></v-tab>
      <v-tab key="Map"></v-tab>
    </v-tabs>
  </div>
</template>

<script>
  import GeoSearchWithMap from './GeoSearchWithMap.vue'
  import GeoSearch from './GeoSearch.vue'

  export default {
    name: 'geo',
    data () {
      selectedTab: 0
    },
    props: {},
    components: {
      GeoSearchWithMap,
      GeoSearch
    }
  }
</script>

<style lang="sass">
  $btn-height: 60px
  .page
    margin-bottom: 20px
  .page-footer
    background-color: white
    box-shadow: 0 0px 10px rgba(0, 0, 0, .3)
    height: $btn-height
    position: fixed
    z-index: 100
    left: 0
    bottom: 0
    padding: 0
    margin: 0
    width: 100%
    .btn
      margin: 0
      width: 50%
      height: $btn-height
</style>

  export default Vue.extend({
    router,
    name: 'geo-search',
    props: {
      selectedGeos: {
        type: Array,
        default: () => []
      },
      baseFilters: {
        type: Object,
        default () {
          return {
            'no-parent': true,
            include_children: false,
            'study': singleton.study ? singleton.study.id : null
          }
        }
      },
      allowedTypes: {
        type: Array,
        default: function () {
          return []
        }
      },
      showRespondentsLink: {
        type: Boolean,
        default: true
      },
      isSelectable: {
        default: false
      },
      shouldUpdateRoute: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number
      }
    },
    data: function () {
      return {
        global: singleton,
        userFilters: this.$route.query.filters ? JSON.parse(this.$route.query.filters) : {
          parent: null,
          types: null
        },
        query: this.$route.query.query,
        geoCache_: {},
        results: [],
        error: null,
        isSearching_: false,
        lastParentIds: [],
        queryChange: debounce(this.search, 300)
      }
    },
    created () {
      this.search().then(this.loadAncestors)
    },
    computed: {
      filters () {
        return Object.assign({}, this.baseFilters, this.userFilters)
      },
      selectedIds () {
        return this.selectedGeos.map(g => g.id)
      },
      ancestors () {
        return this.lastParentIds.map(id => {
          return this.geoCache_[id]
        })
      }
    },
    methods: {
      geoIsSelectable (geo) {
        return typeof this.isSelectable === 'boolean' ? this.isSelectable : this.isSelectable(geo)
      },
      translate (geo) {
        if (!geo || !geo.nameTranslation) return 'No translation'
        return TranslationService.getAny(geo.nameTranslation, this.global.locale)
      },
      loadAncestors () {
        GeoService.getGeoAncestors(this.results[0].id).then(geos => {
          geos.forEach(geo => {
            this.geoCache_[geo.id] = geo
          })
          this.lastParentIds.push(null)
          this.lastParentIds.push(...geos.map(g => g.id))
          this.lastParentIds.pop()
        })
      },
      updateRoute: function () {
        if (!this.shouldUpdateRoute) return
        let q = {}
        if (this.query) {
          q.query = this.query
        }
        q.filters = JSON.stringify(this.filters)
        router.replace({
          name: this.$route.name,
          params: this.$route.params,
          query: q
        })
      },
      moveUpOneLevel: function () {
        this.userFilters.parent = this.lastParentIds[this.lastParentIds.length - 2]
        this.query = null
        this.search().then(() => {
          this.lastParentIds.pop()
        })
      },
      onGeoClick: function (geo) {
        this.query = null
        this.userFilters.parent = geo.id
        this.geoCache_[geo.id] = geo
        this.search().then(() => {
          this.lastParentIds.push(geo.id)
        })
      },
      removeGeo (geo) {
        let index = this.selectedIds.indexOf(geo.id)
        this.selectedGeos.splice(index, 1)
      },
      addGeo (geo) {
        this.selectedGeos.push(geo)
        if (this.limit && this.selectedGeos.length > this.limit) {
          this.selectedGeos.shift()
        }
      },
      selectGeo (geo) {
        if (this.selectedIds.indexOf(geo.id) > -1) {
          this.removeGeo(geo)
        } else {
          this.addGeo(geo)
        }
      },
      onGeoSelect: function (geo) {
        if (this.geoIsSelectable(geo)) {
          this.selectGeo(geo)
        }
      },
      onDone: function () {
        this.$emit('doneSelecting', JSON.parse(JSON.stringify(this.selectedGeos)))
        // Empty the array without breaking references
        while (this.selectedGeos.length) {
          this.selectedGeos.pop()
        }
      },
      search: function () {
        this.isSearching_ = true
        let filters = {}
        if (this.query) {
          filters.query = this.query
        }
        for (let key in this.filters) {
          if (this.filters[key]) {
            filters[key] = this.filters[key]
          }
        }
        return GeoService.search(filters).then(results => {
          this.results = results
          for (let geo of results) {
            this.geoCache_[geo.id] = geo
          }
          this.$emit('returned-geo-results', results, this.userFilters.parent)
        }).catch(err => {
          console.error(err)
          this.error = `Unable to retrieve geos for the current filters`
        }).then(() => {
          this.isSearching_ = false
          this.updateRoute()
        })
      },
      isGeoSelected (geo) {
        return this.selectedIds.indexOf(geo.id) > -1
      }
    },
    components: {
      GeoListTile,
      Cart
    }
  })
</script>

<style lang="sass">
  .move-up
    cursor: pointer
    &:hover
      background: rgba(0, 0, 0, .2)
    .geo-search-dialog
      height: 90%
    .geo-list
      overflow-y: auto
      flex-grow: 1
    .h100
      height: 100%
    .geo-breadcrumbs
      .geo-name:not(:first-child):before
        content: ' \\ '
</style>
