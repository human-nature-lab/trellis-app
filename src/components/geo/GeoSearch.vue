<template>
  <ScrollContainer :class="{'cart-spacing': selectedGeos.length}">
    <template #header>
      <v-row
        no-gutters
        class="align-center px-4"
      >
        <v-btn
          text
          icon
          :disabled="!canMoveUp || isSearching"
          @click="moveUpOneLevel"
          class="mr-2"
        >
          <v-icon>mdi-arrow-left-bold</v-icon>
        </v-btn>
        <v-text-field
          clearable
          v-model="query"
          :placeholder="$t('search')"
          :loading="isSearching"
          @input="queryChange"
        />
      </v-row>
      <v-col class="geo-breadcrumbs pt-0">
        <template v-for="(geo, index) in ancestors">
          <v-btn
            :key="geo.id"
            text
            :disabled="isSearching"
            :class="{ current: index === ancestors.length - 1 }"
            @click="onClickBreadcrumb(geo)"
          >
            {{ translate(geo) }}
          </v-btn>
          <v-icon
            v-if="index < ancestors.length - 1"
            :disabled="isSearching"
            :key="geo.id + 'icon'"
          >
            mdi-arrow-right
          </v-icon>
        </template>
      </v-col>
      <v-alert
        v-show="error"
        color="error"
      >
        {{ error }}
      </v-alert>
      <v-divider v-if="showCart" />
      <Cart
        v-if="showCart"
        @done="onDone"
        @remove="removeGeo"
        :items="selectedGeos"
      >
        <template #default="props">
          <v-chip
            outlined
            close
            close-icon="mdi-close"
            color="primary"
            @click:close="removeGeo(props.item)"
          >
            <v-avatar>
              <v-icon>mdi-home</v-icon>
            </v-avatar>
            {{ translate(props.item) }}
          </v-chip>
        </template>
      </Cart>
      <v-divider v-if="showCart" />
    </template>
    <div class="geo-list">
      <v-container v-if="!results.length">
        <span v-if="isSearching">{{ $t('searching') }}</span>
        <span v-else>{{ $t('no_locations_found') }}</span>
      </v-container>
      <v-list v-show="results.length">
        <geo-list-tile
          v-for="geo in orderedResults"
          :is-selectable="geoIsSelectable(geo)"
          :selected="isGeoSelected(geo)"
          :disabled="isSearching"
          @click="onGeoClick(geo)"
          @geo-select="onGeoSelect(geo)"
          :key="geo.id"
          :geo="geo"
        />
        <v-divider />
        <v-list-item v-if="results.length === defaultSearchResultsLimit">
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('displaying_first_results',[defaultSearchResultsLimit]) }}
            </v-list-item-title>
            <v-list-item-title>
              {{ $t('use_search_field_results') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <v-fab-transition v-if="showAddLocationButton">
      <v-btn
        class="deep-orange"
        @click="$emit('add')"
        fab
        dark
        fixed
        right
      >
        <v-icon style="height:auto;">
          mdi-plus
        </v-icon>
      </v-btn>
    </v-fab-transition>
  </ScrollContainer>
</template>

<script>
import { debounce } from 'lodash'
import GeoListTile from '@/components/geo/GeoListTile.vue'
import Cart from '@/components/geo/Cart.vue'
import GeoService from '@/services/geo'
import TranslationService from '@/services/TranslationService'
import { routeQueue } from '@/router'
import singleton from '@/static/singleton'
import ScrollContainer from '../styles/ScrollContainer.vue'

export default {
  name: 'GeoSearch',
  components: {
    GeoListTile,
    Cart,
    ScrollContainer,
  },
  props: {
    selectedGeos: {
      type: Array,
      default: () => [],
    },
    baseFilters: {
      type: Object,
      default () {
        return {
          'no-parent': true,
          includeChildren: false,
        }
      },
    },
    showAddLocationButton: {
      type: Boolean,
      default: false,
    },
    showRespondentsLink: {
      type: Boolean,
      default: true,
    },
    isSelectable: {
      default: false,
    },
    showCart: {
      type: Boolean,
      default: false,
    },
    shouldUpdateRoute: {
      type: Boolean,
      default: true,
    },
    limit: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      defaultSearchResultsLimit: GeoService.getDefaultSearchResultsLimit(),
      global: singleton,
      userFilters: {
        parent: null,
        types: null,
      },
      query: this.$route.query.query,
      geoCache_: {},
      results: [],
      error: null,
      isSearching: false,
      lastParentIds: [],
      queryChange: debounce(this.search, 300),
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
    canMoveUp () {
      return this.lastParentIds.length > 1
    },
    orderedResults () {
      function compare (a, b) {
        const aTransText = a.nameTranslation.translationText.find((tt) => tt.localeId === singleton.locale.id)
        const bTransText = b.nameTranslation.translationText.find((tt) => tt.localeId === singleton.locale.id)
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
      }).filter(g => !!g)
    },
  },
  methods: {
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
      const q = {}
      if (this.query) {
        q.query = this.query
      }
      q.filters = JSON.stringify(this.filters)
      routeQueue.replace({
        name: this.$route.name,
        params: this.$route.params,
        query: q,
      })
    },
    moveUpOneLevel () {
      this.userFilters.parent = this.lastParentIds[this.lastParentIds.length - 2]
      this.query = null
      this.search().then(() => {
        this.lastParentIds.pop()
      })
    },
    async onGeoClick (geo) {
      // Can't select a location that doesn't follow the heirarchy
      if (this.userFilters.parent !== geo.parentId) {
        return
      }
      this.query = null
      this.userFilters.parent = geo.id
      this.geoCache_[geo.id] = geo
      await this.search()
      this.lastParentIds.push(geo.id)
    },
    async onClickBreadcrumb (geo) {
      if (this.userFilters.parent === geo.id) {
        return
      }
      this.query = null
      this.userFilters.parent = geo.id
      const index = this.lastParentIds.indexOf(geo.id)
      await this.search()
      this.lastParentIds = this.lastParentIds.slice(0, index + 1)
    },
    removeGeo (geo) {
      const index = this.selectedIds.indexOf(geo.id)
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
      this.$emit('doneSelecting', this.selectedGeos.slice())
      // Empty the array without breaking references
      while (this.selectedGeos.length) {
        this.selectedGeos.pop()
      }
    },
    async search () {
      this.isSearching = true
      const filters = {}
      if (this.query) {
        filters.query = this.query
      }
      for (const key in this.filters) {
        if (this.filters.hasOwnProperty(key) && this.filters[key]) {
          filters[key] = this.filters[key]
        }
      }
      try {
        const results = await GeoService.search(this.global.study.id, filters)
        this.results = results
        for (const geo of results) {
          this.geoCache_[geo.id] = geo
        }
        this.$emit('returned-geo-results', results, this.userFilters.parent)
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err, 'Unable to retrieve geos for the current filters')
        }
      } finally {
        this.isSearching = false
        this.updateRoute()
      }
    },
    isGeoSelected (geo) {
      return this.selectedIds.indexOf(geo.id) > -1
    },
  },
  watch: {
    'userFilters.parent': function (newParentId, oldParentId) {
      if (newParentId !== oldParentId) {
        this.$emit('parent-geo-id-changed', newParentId)
      }
    },
  },
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
  .geo-breadcrumbs
    .current
      text-decoration: underline

</style>
