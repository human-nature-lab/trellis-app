<template>
  <v-container fluid>
    <v-card>
      <v-container fluid>
        <v-alert v-if="error">
          {{this.error}}
        </v-alert>
        <v-layout row wrap>
          <v-text-field
            v-model="query"
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
            @click="onGeoClick(geo)"
            :key="geo.id"
            :geo="geo" />
        </v-list>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
  import _ from 'lodash'
  import GeoService from '@/services/geo/GeoService'
  import GeoListTile from './GeoListTile'
  import singleton from '@/singleton'
  export default {
    name: 'geo-search',
    props: {
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
        this.$emit('geoSelect', geo)
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
      GeoListTile
    }
  }
</script>

<style scoped>

</style>
