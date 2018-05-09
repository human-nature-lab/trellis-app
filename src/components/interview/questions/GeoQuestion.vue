<template>
    <v-flex>
      <v-list>
        <v-list-tile
          v-for="(geo, geoIndex) in geos"
          :key="geo.id">
          <v-list-tile-avatar>
            <v-tooltip top>
              <v-btn
                slot="activator"
                icon
                v-if="editingIndex === geoIndex"
                :disabled="isSavingEdit || isQuestionDisabled"
                @click="stopEditingAndRevert(geo, geoIndex)">
                <v-icon color="red">clear</v-icon>
              </v-btn>
              <span>Revert changes</span>
            </v-tooltip>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <span class="roster-val"
                  v-if="geoIndex !== editingIndex">{{geo.val}}</span>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-spacer />
          <v-list-tile-action>
            <v-btn @click="geoSearchDialog = true">Add Location</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-dialog
        v-model="geoSearchDialog">
        <v-container fluid>
          <v-layout>
            <v-card>
              <h3>Search here</h3>
            </v-card>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-flex>
</template>

<script>
  import GeoService from '@/services/geo/GeoService'
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
        if (!geoIds.length) return
        if (!shouldLoadExisting) {
          geoIds = geoIds.filter(geo => !this.geoCache[geo.id]) // Filter out previously loaded roster rows
        }
        GeoService.getGeosById(geoIds).then(rosterRows => {
          for (let row of rosterRows) {
            this.$set(this.geoCache, row.id, row)
          }
        }).catch(err => {
          this.error = err
        })
      }
    },
    computed: {
      geoIds: function () {
        return this.question.datum.data.map(d => d.geo_id)
      },
      geos: function () {
        console.log('recalculating roster values')
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
    }
  }
</script>

<style scoped>

</style>
