<template>
    <v-flex>
      <v-card>
        <v-list>
          <v-list-tile v-for="geo in geos" :key="geo.id">
            <v-list-tile-content>
              {{geo.name_translation ? translate(geo) : this.$t('loading')}}
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
          <v-icon>add</v-icon>
        </v-btn>
      </v-card>
      <!--we need the geo-search-dialog class for geo search to work correctly in the dialog-->
      <v-dialog
        content-class="geo-search-dialog"
        lazy
        v-model="geoSearchDialog">
        <GeoSearch
          is-selectable
          :selectedGeos="selectedGeos"
          :should-update-route="false"
          @doneSelecting="onDoneSelecting" />
      </v-dialog>
    </v-flex>
</template>

<script>
  import GeoService from '../../../services/geo/GeoService'
  import GeoSearch from '../../geo/GeoSearch'
  import GeoListTile from '../../geo/GeoListTile'
  import TranslationService from '../../../services/TranslationService'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'geo-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
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
        return TranslationService.getAny(geo.name_translation, this.global.locale)
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
        actionBus.action({
          question_id: this.question.id,
          action_type: 'add-geo',
          payload: {
            geo_id: geoId
          }
        })
      },
      remove: function (geoId) {
        actionBus.action({
          question_id: this.question.id,
          action_type: 'remove-geo',
          payload: {
            geo_id: geoId
          }
        })
      },
      onDoneSelecting: function (selectedGeos) {
        let added = []
        let removed = []
        for (let geo of selectedGeos) {
          let index = this.geoIds.indexOf(geo.id)
          if (index === -1) {
            this.geoCache[geo.id] = geo
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
      }
    },
    computed: {
      geoIds: function () {
        return this.question.datum.data.map(d => d.geo_id)
      },
      geos: function () {
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
      }
    },
    components: {
      GeoSearch,
      GeoListTile
    }
  }
</script>
