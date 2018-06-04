<template>
  <v-container fluid>
    <v-card>
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
        <v-list>
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
            :selected="selected.indexOf(geo.id) > -1"
            @click="onGeoClick(geo)"
            @geo-select="onGeoSelect(geo)"
            :key="geo.id"
            :geo="geo" />
        </v-list>
        <Cart
          v-if="selected.length"
          @done="onDone"
          :items="selected">
          <v-flex slot name="item">
            Item
          </v-flex>
        </Cart>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
  import _ from 'lodash'
  import GeoService from '@/services/geo/GeoService'
  import GeoListTile from './GeoListTile'
  import Cart from './Cart'
  import singleton from '@/singleton'
  export default {
    name: 'geo-search',
    props: {
      selectedIds: {
        type: Array
      },
      baseFilters: {
        type: Object,
        default: function () {
          return {
            'no-parent': true,
            'study': singleton.study ? singleton.study.id : null
          }
        }
      },
      allowedTypes: {
        type: Array,
        default: function () {
          return []
        }
      }
    },
    data: function () {
      return {
        userFilters: {
          parent: null,
          types: null
        },
        query: '',
        results: [],
        added: [],
        removed: [],
        error: null,
        isSearching_: false,
        lastParentIds: [],
        queryChange: _.debounce(this.search, 300)
      }
    },
    mounted: function () {
      this.search()
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
      }
    },
    methods: {
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
        this.search().then(() => {
          this.lastParentIds.push(prevId)
        })
      },
      onGeoSelect: function (geo) {
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
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isSearching_ = false
        })
      }
    },
    components: {
      GeoListTile,
      Cart
    }
  }
</script>

<style lang="sass" scoped>
.cart-spacing
  padding-bottom: 150px
.cart
  border-top: 1px solid grey
  position: absolute
  bottom: 0
  left: 0
</style>
