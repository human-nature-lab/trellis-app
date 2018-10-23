<template>
  <v-card class="geo-search h100" :class="{'cart-spacing': selectedGeos.length}">
    <v-layout column class="h100">
      <div class="search-header">
        <v-container fluid class="pb-0">
          <v-layout row wrap>
            <v-text-field
              v-model="query"
              :placeholder="$t('search')"
              :loading="isSearching"
              @input="queryChange">
            </v-text-field>
          </v-layout>
          <v-layout class="geo-breadcrumbs">
            <span
              v-for="geo in ancestors"
              v-if="geo"
              class="geo-name">
              {{ translate(geo) }}
            </span>
          </v-layout>
          <v-alert v-show="error" color="error">
            {{ error }}
          </v-alert>
          <v-container
            class="move-up"
            v-if="lastParentIds.length > 1"
            @click="moveUpOneLevel">
            <v-layout row>
              <v-flex xs1>
                <v-icon>arrow_upward</v-icon>
              </v-flex>
              <v-spacer></v-spacer>
              <v-flex xs1 class="text-lg-right">
                <v-icon>arrow_upward</v-icon>
              </v-flex>
            </v-layout>
          </v-container>
        </v-container>
      </div>
      <div class="geo-list">
        <v-list v-if="results.length">
          <geo-list-tile
            v-for="geo in results"
            :isSelectable="geoIsSelectable(geo)"
            :selected="isGeoSelected(geo)"
            @click="onGeoClick(geo)"
            @geo-select="onGeoSelect(geo)"
            :key="geo.id"
            :geo="geo">
          </geo-list-tile>
        </v-list>
        <v-flex v-else>
          <span v-if="isSearching">{{ $t('searching') }}</span>
          <span v-else>{{ $t('no_locations_found') }}</span>
        </v-flex>
      </div>
      <div v-if="selectedGeos.length">
        <v-card>
          <v-container fluid>
            <Cart
              @done="onDone"
              @remove="removeGeo"
              :items="selectedGeos">
              <template slot-scope="props">
                <v-chip close @input="removeGeo(props.item)">
                  {{translate(props.item)}}
                </v-chip>
              </template>
            </Cart>
          </v-container>
        </v-card>
      </div>
    </v-layout>
  </v-card>
</template>

<script>
  // @ts-ignore
  import GeoListTile from './GeoListTile'
  // @ts-ignore
  import Cart from '../Cart'
  import debounce from 'lodash/debounce'
  import GeoService from '../../services/geo/GeoService'
  import TranslationService from '../../services/TranslationService'
  import singleton from '../../static/singleton'
  import router from '../../router'
  import Vue from 'vue'
  export default Vue.extend({
    router,
    name: 'geo-search',
    props: {
      selectedGeos: {
        type: Array,
        'default': () => []
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
        'default': function () {
          return []
        }
      },
      showRespondentsLink: {
        type: Boolean,
        'default': true
      },
      isSelectable: {
        'default': false
      },
      shouldUpdateRoute: {
        type: Boolean,
        'default': true
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
        isSearching: false,
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
        if (!geo || !geo.nameTranslation) return this.$t('no_translation')
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
        this.isSearching = true
        let filters = {}
        if (this.query) {
          filters.query = this.query
        }
        for (let key in this.filters) {
          if (this.filters.hasOwnProperty(key) && this.filters[key]) {
            filters[key] = this.filters[key]
          }
        }
        return GeoService.search(filters).then(results => {
          this.results = results
          console.log('this.results', this.results)
          for (let geo of results) {
            this.geoCache_[geo.id] = geo
          }
          this.$emit('returned-geo-results', results, this.userFilters.parent)
        }).catch(err => {
          console.error(err)
          this.error = `Unable to retrieve geos for the current filters`
        }).then(() => {
          this.isSearching = false
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
  .geo-search
    margin-bottom: 60px
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
