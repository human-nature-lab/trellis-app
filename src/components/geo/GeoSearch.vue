<template>
  <v-card class="geo-search h100" :class="{'cart-spacing': selectedGeos.length}">
    <v-col class="h100">
      <div class="search-header">
        <v-container fluid class="pb-0">
          <v-row>
            <v-col cols="10">
              <v-text-field
                xs11
                v-model="query"
                :placeholder="$t('search')"
                :loading="isSearching"
                @input="queryChange">
              </v-text-field>
            </v-col>
            <v-col cols="2">
              <v-btn
                color="primary"
                @click="showAddLocationDialog = true"
                :disabled="isSearching">
                {{ $t("add_geo") }}
              </v-btn>
            </v-col>
          </v-row>
          <v-col class="geo-breadcrumbs">
            <span
              v-for="geo in ancestors"
              v-if="geo"
              class="geo-name">
              {{ translate(geo) }}
            </span>
          </v-col>
          <v-alert v-show="error" color="error">
            {{ error }}
          </v-alert>
          <v-divider v-if="showCart" />
          <Cart
            v-if="showCart"
            @done="onDone"
            @remove="removeGeo"
            :items="selectedGeos">
            <template #default="props">
              <v-chip
                outlined
                close
                close-icon="mdi-close"
                color="primary"
                @click:close="removeGeo(props.item)">
                <v-avatar>
                  <v-icon>mdi-home</v-icon>
                </v-avatar>
                {{translate(props.item)}}
              </v-chip>
            </template>
          </Cart>
          <v-divider v-if="showCart"></v-divider>
        </v-container>
      </div>
      <div class="geo-list">
        <v-container v-if="!results.length">
          <span v-if="isSearching">{{ $t('searching') }}</span>
          <span v-else>{{ $t('no_locations_found') }}</span>
        </v-container>
        <v-list>
          <v-list-item @click="moveUpOneLevel" v-if="lastParentIds.length > 1">
            <v-container>
              <v-row>
                <v-col cols="1"><v-icon>mdi-arrow-up</v-icon></v-col>
                <v-col cols="10" class="text-center">{{ $t('up_one_level') }}</v-col>
                <v-col cols="1"><v-icon>mdi-arrow-up</v-icon></v-col>
              </v-row>
            </v-container>
          </v-list-item>
          <v-divider/>
          <geo-list-tile
            v-if="results.length"
            v-for="geo in orderedResults"
            :isSelectable="geoIsSelectable(geo)"
            :selected="isGeoSelected(geo)"
            @click="onGeoClick(geo)"
            @geo-select="onGeoSelect(geo)"
            :key="geo.id"
            :geo="geo">
          </geo-list-tile>
          <v-divider></v-divider>
          <v-list-item v-if="results.length === defaultSearchResultsLimit">
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('displaying_first_results',[defaultSearchResultsLimit]) }}
              </v-list-item-title>
              <v-list-item-sub-title>
                {{ $t('use_search_field_results') }}
              </v-list-item-sub-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </v-col>
    <AddGeoForm
      @close="closeAddLocationDialog"
      :adding="showAddLocationDialog"
      :parent-geo-id="parentGeoId"
    />
  </v-card>
</template>

<script>
  import GeoListTile from './GeoListTile'
  import Cart from '../Cart'
  import debounce from 'lodash/debounce'
  import GeoService from '../../services/geo/GeoService'
  import TranslationService from '../../services/TranslationService'
  import singleton from '../../static/singleton'
  import { routeQueue } from '../../router'
  import global from '../../static/singleton'
  import AddGeoForm from './AddGeoForm'
  import Geo from '../../entities/trellis/Geo'

  export default {
    name: 'geo-search',
    components: {
      AddGeoForm,
      Cart,
      GeoListTile
    },
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
            includeChildren: false
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
      showCart: {
        type: Boolean,
        default: false
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
        queryChange: debounce(this.search, 300),
        showAddLocationDialog: false
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
      parentGeoId () {
        if (this.lastParentIds && this.lastParentIds.length && this.lastParentIds[this.lastParentIds.length - 1]) {
          return this.lastParentIds[this.lastParentIds.length - 1]
        }
        return null
      },
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
      closeAddLocationDialog (geo) {
        this.showAddLocationDialog = false
        if (geo instanceof Geo) {
          // Created new Geo, update search
          this.search()
        }
      },
      geoIsSelectable (geo) {
        return typeof this.isSelectable === 'boolean' ? this.isSelectable : this.isSelectable(geo)
      },
      translate (geo) {
        if (!geo || !geo.nameTranslation) return this.$t('no_translation')
        return TranslationService.getAny(geo.nameTranslation, this.global.locale)
      },
      async loadAncestors () {
        try {
          if (this.results && this.results.length) {
            const geos = await GeoService.getGeoAncestors(this.results[0].id)
            geos.forEach(geo => {
              this.geoCache_[geo.id] = geo
            })
            this.lastParentIds.push(null)
            this.lastParentIds.push(...geos.map(g => g.id))
            this.lastParentIds.pop()
          }
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      updateRoute: function () {
        if (!this.shouldUpdateRoute) return
        let q = {}
        if (this.query) {
          q.query = this.query
        }
        q.filters = JSON.stringify(this.filters)
        routeQueue.replace({
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
      async search () {
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
        try {
          const results = await GeoService.search(this.global.study.id, filters)
          this.results = results
          for (let geo of results) {
            this.geoCache_[geo.id] = geo
          }
          this.$emit('returned-geo-results', results, this.userFilters.parent)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, `Unable to retrieve geos for the current filters`)
          }
        } finally {
          this.isSearching = false
          this.updateRoute()
        }
      },
      isGeoSelected (geo) {
        return this.selectedIds.indexOf(geo.id) > -1
      }
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
    padding-bottom: 60px
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
