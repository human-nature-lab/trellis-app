<template>
    <v-flex>
      <v-card>
        <v-list>
          <v-list-tile v-for="geo in geos" :key="geo.id">
            <v-list-tile-content>
              <span v-if="geo.nameTranslation">
                <GeoBreadcrumbs
                  :canNavigate="false"
                  :geoId="geo.id"
                  :maxDepth="3" />
              </span>
              <span v-else>
                {{ $t('loading') }}
              </span>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-btn
          absolute
          color="primary"
          fab
          bottom
          right
          @click="openGeoSearch()">
          <v-icon
            style="height:auto;">{{geoIds.length ? 'edit': 'add'}}</v-icon>
        </v-btn>
      </v-card>
      <!--we need the geo-search-dialog class for geo search to work correctly in the dialog-->
      <v-dialog
        content-class="geo-search-dialog"
        fullscreen
        lazy
        v-model="geoSearchDialog">
        <ModalTitle
          :title="$t('location_search')"
          @close="geoSearchDialog=false"/>
        <GeoSearch
          :showCart="true"
          :isSelectable="isGeoSelectable"
          :selectedGeos="selectedGeos"
          :shouldUpdateRoute="false"
          @doneSelecting="onDoneSelecting" />
      </v-dialog>
    </v-flex>
</template>

<script>
  import GeoService from '../../../services/geo/GeoService'
  import GeoSearch from '../../geo/GeoSearch'
  import GeoBreadcrumbs from '../../geo/GeoBreadcrumbs'
  import GeoListTile from '../../geo/GeoListTile'
  import TranslationService from '../../../services/TranslationService'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  import PT from '../../../static/parameter.types'
  import global from '../../../static/singleton'
  import AsyncTranslationText from '../../AsyncTranslationText.vue'
  import ModalTitle from '../../ModalTitle'
  export default {
    name: 'geo-question',
    mixins: [ActionMixin],
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        global,
        selectedGeos: [],
        geoSearchDialog: false,
        geoCache: {}
      }
    },
    created: function () {
      this.loadGeos(this.geoIds)
    },
    methods: {
      translate (geo) {
        return TranslationService.getAny(geo.nameTranslation, this.global.locale)
      },
      openGeoSearch () {
        this.selectedGeos = this.geos.map(g => g)
        this.geoSearchDialog = true
      },
      loadGeos: function (geoIds, shouldLoadExisting = false) {
        geoIds = Array.from(new Set(geoIds))
        if (!geoIds.length) return
        let needLoaded = []
        let needRefreshed = []
        if (!shouldLoadExisting) {
          for (let id of geoIds) {
            if (this.geoCache[id]) {
              needRefreshed.push(id)
            } else {
              needLoaded.push(id)
            }
          }
        }
        GeoService.getGeosById(needLoaded).then(geos => {
          for (let geo of geos) {
            this.$set(this.geoCache, geo.id, geo)
          }
        }).catch(err => {
          this.error = err
        })
        for (let id of needRefreshed) {
          console.log('refreshing', id)
          this.$set(this.geoCache, id, this.geoCache[id])
        }
      },
      add: function (geoId) {
        this.action(AT.add_geo, {
          geo_id: geoId
        })
      },
      remove: function (geoId) {
        this.action(AT.remove_geo, {
          geo_id: geoId
        })
      },
      onDoneSelecting: function (selectedGeos) {
        let added = []
        let removed = []
        for (let geo of selectedGeos) {
          this.geoCache[geo.id] = geo
          let index = this.geoIds.indexOf(geo.id)
          if (index === -1) {
            added.push(geo.id)
          }
        }
        for (let id of this.geoIds) {
          let index = selectedGeos.findIndex(g => g.id === id)
          if (index === -1) {
            removed.push(id)
          }
        }
        for (let id of added) {
          this.add(id)
        }
        for (let id of removed) {
          this.remove(id)
        }
        this.geoSearchDialog = false
        this.loadGeos(this.geoIds)
      },
      isGeoSelectable (geo) {
        return this.allowedGeoTypes.indexOf(geo.geoType.name.replace(/\s/g, '').toLowerCase()) > -1
      }
    },
    computed: {
      geoIds () {
        return this.question.datum.data.map(d => d.geoId)
      },
      geos () {
        console.log('recalculating any new geos to load')
        let toLoad = []
        let rows = this.geoIds.map(id => {
          if (this.geoCache[id]) {
            return this.geoCache[id]
          } else {
            return {id: id, val: 'Loading...', isLoading: true}
          }
        })
        this.loadGeos(toLoad)
        return rows
      },
      allowedGeoTypes () {
        const types = []
        for (let qp of this.question.questionParameters) {
          if (qp.parameterId == PT.geo_type) {
            types.push(qp.val.replace(/\s/g, '').toLowerCase())
          }
        }
        return types
      }
    },
    components: {
      AsyncTranslationText,
      GeoSearch,
      GeoListTile,
      ModalTitle,
      GeoBreadcrumbs
    }
  }
</script>
