<template>
  <v-container fluid class="geo-search" :class="{'cart-spacing': selected.length}">
    <v-alert v-if="error">
      {{this.error}}
    </v-alert>
    <v-layout row wrap>
      <v-text-field
        v-model="query"
        placeholder="Search..."
        :loading="isSearching_"
        @input="queryChange"/>
    </v-layout>
    <v-layout class="geo-breadcrumbs">
      <span
        v-for="geo in ancestors"
        class="geo-name">
        {{translate(geo)}}
      </span>
    </v-layout>
    <v-list v-if="results.length">
      <v-list-tile
        v-if="lastParentIds.length"
        @click="moveUpOneLevel">
        <v-list-tile-content>
          <v-container>
            <v-layout row>
              <v-flex xs1>
                <v-icon>arrow_upward</v-icon>
              </v-flex>
              <v-spacer />
              <v-flex xs1 class="text-lg-right">
                <v-icon>arrow_upward</v-icon>
              </v-flex>
            </v-layout>
          </v-container>
        </v-list-tile-content>
      </v-list-tile>
      <GeoListTile
        v-for="geo in results"
        :showRespondentsLink="showRespondentsLink"
        :isSelectable="isSelectable"
        :selected="selected.indexOf(geo.id) > -1"
        @click="onGeoClick(geo)"
        @geo-select="onGeoSelect(geo)"
        :key="geo.id"
        :geo="geo" />
    </v-list>
    <v-flex v-else>
      <span v-if="query">No locations match this query...</span>
      <span v-else>It appears that no locations have been added to the database</span>
    </v-flex>
    <Cart
      v-if="selected.length"
      @done="onDone"
      :items="selected">
      <v-flex slot name="item">
        Item
      </v-flex>
    </Cart>
  </v-container>
</template>

<script>
  import _ from 'lodash'
  import GeoService from '../../services/geo/GeoService'
  import GeoListTile from './GeoListTile'
  import Cart from '../Cart'
  import singleton from '../../static/singleton'
  import TranslationService from '../../services/TranslationService'
  import router from '../../router'
  export default {
    name: 'geo-search',
    props: {
      selectedIds: {
        type: Array,
        default: () => []
      },
      baseFilters: {
        type: Object,
        default () {
          return {
            'no-parent': true,
            include_children: true,
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
        type: Boolean,
        default: false
      },
      shouldUpdateRoute: {
        type: Boolean,
        default: true
      }
    },
    head: {
      title: {
        inner: 'Geo Search'
      }
    },
    data: function () {
      return {
        userFilters: this.$route.query.filters ? JSON.parse(this.$route.query.filters) : {
          parent: null,
          types: null
        },
        query: this.$route.query.query,
        ancestorCache_: {},
        results: [],
        added: [],
        removed: [],
        error: null,
        isSearching_: false,
        lastParentIds: [],
        queryChange: _.debounce(this.search, 300)
      }
    },
    created () {
      this.search().then(this.loadAncestors)
    },
    computed: {
      filters: function () {
        return Object.assign({}, this.baseFilters, this.userFilters)
      },
      selected: function () {
        let selected = this.selectedIds
        for (let id of this.added) {
          selected.push(id)
        }
        return selected.filter(id => this.removed.indexOf(id) === -1)
      },
      ancestors () {
        return this.lastParentIds.map(id => {
          return this.ancestorCache_[id]
        })
      }
    },
    methods: {
      translate (geo) {
        if (!geo || !geo.name_translation) return 'No translation'
        return TranslationService.getAny(geo.name_translation, this.global.locale.id)
      },
      loadAncestors () {
        GeoService.getGeoAncestors(this.results[0].id).then(geos => {
          geos.forEach(geo => {
            this.ancestorCache_[geo.id] = geo
          })
          this.lastParentIds.push(...geos.map(g => g.id))
          this.lastParentIds.pop()
        })
      },
      updateRoute () {
        if (!this.shouldUpdateRoute) return
        router.replace({
          name: this.$route.name,
          params: this.$route.params,
          query: {
            query: this.query,
            filters: JSON.stringify(this.filters)
          }
        })
      },
      moveUpOneLevel: function () {
        let lastId = this.lastParentIds[this.lastParentIds.length - 1]
        this.userFilters.parent = lastId
        this.query = null
        this.search().then(() => {
          this.lastParentIds.pop()
        })
      },
      onGeoClick: function (geo) {
        this.query = null
        let prevId = this.filters.parent
        this.userFilters.parent = geo.id
        this.ancestorCache_[geo.id] = geo
        this.search().then(() => {
          this.lastParentIds.push(prevId)
        })
      },
      selectGeo (geo) {
        let sIndex = this.selected.indexOf(geo.id)
        let aIndex = this.added.indexOf(geo.id)
        let rIndex = this.removed.indexOf(geo.id)
        if (aIndex > -1) {
          this.added.splice(aIndex, 1)
        } else if (rIndex > -1) {
          this.removed.splice(rIndex, 1)
        } else if (sIndex > -1) {
          this.removed.push(geo.id)
        } else {
          this.added.push(geo.id)
        }
        this.$emit('geoSelected', geo)
      },
      onGeoSelect: function (geo) {
        if (this.isSelectable) {
          this.selectGeo(geo)
        }
      },
      onDone: function () {
        this.$emit('doneSelecting', this.added, this.removed)
        this.added = []
        this.removed = []
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
          this.$emit('returned-geo-results', results)
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isSearching_ = false
          this.updateRoute()
        })
      }
    },
    components: {
      GeoListTile,
      Cart
    }
  }
</script>
