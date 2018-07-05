<template>
    <v-flex>
      <v-list>
        <GeoListTile
          v-for="geo in geos"
          :geo="geo"
          hide-select
          :key="geo.id">
        </GeoListTile>
        <v-list-tile>
          <v-spacer />
          <v-list-tile-action>
            <v-btn @click="geoSearchDialog = true">Add Location</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-dialog
        lazy
        v-model="geoSearchDialog">
        <v-container fluid>
          <v-card>
            <GeoSearch
              :selectedIds="geoIds"
              @doneSelecting="onDoneSelecting" />
          </v-card>
        </v-container>
      </v-dialog>
    </v-flex>
</template>

<script>
  import GeoService from '../../../services/geo/GeoService'
  import GeoSearch from '../../geo/GeoSearch'
  import GeoListTile from '../../geo/GeoListTile'
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
        geoSearchDialog: false,
        geoCache: {}
      }
    },
    created: function () {
      this.loadGeos(this.geoIds)
    },
    methods: {
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
      onDoneSelecting: function (added, removed) {
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

<style scoped>

</style>
