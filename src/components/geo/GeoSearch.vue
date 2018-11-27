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
          <v-divider />
          <Cart
            @done="onDone"
            @remove="removeGeo"
            :items="selectedGeos">
            <template slot-scope="props">
              <v-chip
                outline
                close
                color="primary"
                @input="removeGeo(props.item)">
                <v-avatar>
                  <v-icon>home</v-icon>
                </v-avatar>
                {{translate(props.item)}}
              </v-chip>
            </template>
          </Cart>
          <v-divider />
          <v-container
            v-ripple
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
            v-for="geo in orderedResults"
            :isSelectable="geoIsSelectable(geo)"
            :selected="isGeoSelected(geo)"
            @click="onGeoClick(geo)"
            @geo-select="onGeoSelect(geo)"
            :key="geo.id"
            :geo="geo">
          </geo-list-tile>
          <v-divider />
          <v-list-tile v-if="results.length === defaultSearchResultsLimit">
            <v-list-tile-content>
              <v-list-tile-title>
                {{ $t('displaying_first_results',[defaultSearchResultsLimit]) }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ $t('use_search_field_results') }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-flex v-else>
          <span v-if="isSearching">{{ $t('searching') }}</span>
          <span v-else>{{ $t('no_locations_found') }}</span>
        </v-flex>
      </div>
    </v-layout>
  </v-card>
</template>

<script>
  import GeoListTile from './GeoListTile'
  import Cart from '../Cart'
  import debounce from 'lodash/debounce'
  import GeoService from '../../services/geo/GeoService'
  import TranslationService from '../../services/TranslationService'
  import singleton from '../../static/singleton'
  import router from '../../router'
  import global from '../../static/singleton'

  export default {
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
            includeChildren: false,
            study: singleton.study ? singleton.study.id : null
          }
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
    data () {
      return {
        defaultSearchResultsLimit: GeoService.getDefaultSearchResultsLimit(),
        global: singleton,
        userFilters: {
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
      if (this.$route.query.filters) {
        this.userFilters = JSON.parse(this.$route.query.filters)
        this.$emit('parent-geo-id-changed', this.userFilters.parent)
      }
      this.search().then(this.loadAncestors)
    },
    computed: {
      filters () {
        return Object.assign({}, this.baseFilters, this.userFilters)
      },
      orderedResults () {
        function compare(a, b) {
          const aTransText = a.nameTranslation.translationText.find((tt) => tt.localeId === global.locale.id)
          const bTransText = b.nameTranslation.translationText.find((tt) => tt.localeId === global.locale.id)
          const aName = aTransText ? aTransText.translatedText : (a.nameTranslation.translationText.length ? a.nameTranslation.translationText[0].translatedText : '')
          const bName = bTransText ? bTransText.translatedText : (b.nameTranslation.translationText.length ? b.nameTranslation.translationText[0].translatedText : '')
          // TODO: je104 comes before je004, would need to split into numeric and non-numeric and sort separately
          return aName.localeCompare(bName)
        }
        return this.results.sort(compare)
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
      onGeoSelect (geo) {
        if (this.geoIsSelectable(geo)) {
          this.selectGeo(geo)
        }
      },
      onDone () {
        this.$emit('doneSelecting', this.selectedGeos.map(s => s.copy()))
        // Empty the array without breaking references
        while (this.selectedGeos.length) {
          this.selectedGeos.pop()
        }
      },
      search () {
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
          for (let geo of results) {
            this.geoCache_[geo.id] = geo
          }
          this.$emit('returned-geo-results', results, this.userFilters.parent)
        }).catch(err => {
          this.log({
            message: `Unable to retrieve geos for the current filters`
          })
          this.log(err)
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
    },
    watch : {
      'userFilters.parent': function (newParentId, oldParentId) {
        if (newParentId !== oldParentId) {
          this.$emit('parent-geo-id-changed', newParentId)
        }
      }
    }
  }
</script>

<style lang="sass">
  .list__tile__title
    height: 30px
  .geo-search
    margin-bottom: 60px
  .move-up
    cursor: pointer
    &:hover
      background: rgba(0, 0, 0, .2)
  /*.geo-search-dialog*/
    /*height: 90%*/
  .geo-list
    overflow-y: auto
    flex-grow: 1
  .h100
    height: 100%
  .geo-breadcrumbs
    .geo-name:not(:first-child):before
      content: ' \\ '
</style>
