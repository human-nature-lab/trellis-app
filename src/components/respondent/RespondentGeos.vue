<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>Locations</v-toolbar-title>
      <v-spacer />
      <permission :role-whitelist="['admin','manager']">
        <v-tooltip>
          <v-btn
            slot="activator"
            icon
            @click="geoSearchModal = true">
            <v-icon>add</v-icon>
          </v-btn>
          <span>Add a respondent location</span>
        </v-tooltip>
      </permission>
    </v-toolbar>
    <v-alert v-show="error" color="error">{{error}}</v-alert>
    <v-data-table
      disable-initial-sort
      class="mb-3"
      :headers="locationHeaders"
      :items="locations"
      hide-actions>
      <template slot="items" slot-scope="props">
        <td>
          <GeoBreadcrumbs
            :geo-id="props.item.id" />
        </td>
        <td>
          {{props.item.type}}
        </td>
        <td>
          <v-icon v-if="props.item.pivot.is_current">check</v-icon>
        </td>
        <permission :role-whitelist="['admin', 'manager']">
          <td>
            <v-tooltip v-if="!props.item.pivot.is_current">
              <v-btn
                slot="activator"
                icon
                @click="remove(props.item.pivot.id)">
                <v-icon>delete</v-icon>
              </v-btn>
              <span>Remove this location</span>
            </v-tooltip>
            <v-tooltip>
              <v-btn
                v-if="props.item.pivot.is_current"
                icon
                slot="activator"
                @click="startMove(props.item)">
                <v-icon>arrow_forward</v-icon>
              </v-btn>
              <span>Move this location to a new location</span>
            </v-tooltip>
          </td>
        </permission>
      </template>
    </v-data-table>
    <v-dialog
      content-class="geo-search-dialog"
      lazy
      v-model="geoSearchModal">
      <GeoSearch
        :limit="1"
        is-selectable
        :should-update-route="false"
        @doneSelecting="geoSelected" />
    </v-dialog>
  </v-flex>
</template>

<script>
  import TranslationService from '../../services/TranslationService'
  import RespondentService from '../../services/respondent/RespondentService'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import GeoSearch from '../geo/GeoSearch'
  import Permission from '../Permission'
  export default {
    components: {GeoBreadcrumbs, GeoSearch, Permission},
    name: 'respondent-geos',
    props: {
      respondent: {
        type: Object,
        required: true
      }
    },
    data: () => ({
      isAddingGeo: false,
      geoSearchModal: false,
      movingRespondentGeo: null,
      error: null,
      locationHeaders: [{
        text: 'Name',
        value: 'translated'
      }, {
        text: 'Type',
        value: 'type'
      }, {
        text: 'Current',
        value: 'isCurrent'
      }]
    }),
    methods: {
      startMove (respondentGeo) {
        this.movingRespondentGeo = respondentGeo
        this.geoSearchModal = true
      },
      moveGeo (respondentGeo, geo) {
        return RespondentService.moveRespondentGeo(this.respondent.id, respondentGeo.pivot.id, geo.id).then(resGeo => {
          let index = this.respondent.geos.findIndex(rg => rg.id === respondentGeo.id)
          this.respondent.geos.splice(index, 1, resGeo)
        })
      },
      addGeo (geo) {
        return RespondentService.addRespondentGeo(this.respondent.id, geo.id).then(returnedGeo => {
          this.respondent.geos.push(returnedGeo)
        })
      },
      remove (respondentGeoId) {
        return RespondentService.removeRespondentGeo(this.respondent.id, respondentGeoId).then(() => {
          let index = this.respondent.geos.findIndex(g => g.pivot.id === respondentGeoId)
          this.respondent.geos.splice(index, 1)
        })
      },
      async geoSelected (geos) {
        if (geos.length > 1) this.error = 'Unable to add more than one respondent geo at a time'
        this.isAddingGeo = true
        try {
          if (this.movingRespondentGeo) {
            await this.moveGeo(this.movingRespondentGeo, geos[0])
          } else {
            await this.addGeo(geos[0])
          }
        } catch (err) {
          this.error = 'Unable to add or move respondent geo'
        } finally {
          this.isAddingGeo = false
          this.movingRespondentGeo = null
          this.geoSearchModal = false
        }
      }
    },
    computed: {
      locations () {
        return this.respondent.geos.map(geo => {
          geo.translated = TranslationService.getAny(geo.name_translation, this.global.locale.id)
          geo.type = geo.geo_type.name
          geo.isCurrent = geo.pivot.is_current
          return geo
        })
      }
    }
  }
</script>

<style scoped>

</style>
