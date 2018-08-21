<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('locations') }}</v-toolbar-title>
      <v-spacer />
      <permission :role-whitelist="['admin','manager']">
        <v-tooltip>
          <v-btn
            slot="activator"
            icon
            @click="geoSearchModal = true">
            <v-icon>add</v-icon>
          </v-btn>
          <span>{{ $t('add_locations') }}</span>
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
            :geo-id="props.item.geoId" />
        </td>
        <td>
          {{props.item.geo.geoType.name}}
        </td>
        <td>
          <v-icon v-if="props.item.isCurrent">check</v-icon>
        </td>
        <permission :role-whitelist="['admin', 'manager']">
          <td>
            <v-tooltip v-if="!props.item.isCurrent">
              <v-btn
                slot="activator"
                icon
                @click="remove(props.item.id)">
                <v-icon>delete</v-icon>
              </v-btn>
              <span>{{ $t('remove_location') }}</span>
            </v-tooltip>
            <v-tooltip>
              <v-btn
                v-if="props.item.isCurrent"
                icon
                slot="activator"
                @click="startMove(props.item)">
                <v-icon>arrow_forward</v-icon>
              </v-btn>
              <span>{{ $t('move_respondent_location') }}</span>
            </v-tooltip>
          </td>
        </permission>
      </template>
    </v-data-table>
    <v-dialog
      :value="showProgressDialog"
      lazy>
      <v-card>
        <v-container fluid>
          <h4>{{progressMessage}}</h4>
          <v-progress-linear indeterminate />
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog
      content-class="geo-search-dialog"
      lazy
      v-model="geoSearchModal">
      <GeoSearch
        :limit="1"
        :is-selectable="geoIsSelectable"
        :should-update-route="false"
        @doneSelecting="geoSelected" />
    </v-dialog>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  // @ts-ignore
  import GeoSearch from '../geo/GeoSearch'
  // @ts-ignore
  import Permission from '../Permission'
  import RespondentService from '../../services/respondent/RespondentService'
  import CensusFormService from '../../services/census/index'
  import CensusTypes from '../../static/census.types'
  import Respondent from "../../entities/trellis/Respondent"
  import RespondentGeo from "../../entities/trellis/RespondentGeo"
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import singleton from '../../static/singleton'
  export default Vue.extend({
    components: {GeoBreadcrumbs, GeoSearch, Permission},
    name: 'respondent-geos',
    props: {
      studyId: {
        type: String
      },
      respondent: {
        type: Respondent,
        required: true
      },
      useCensusForm: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      global: singleton,
      isAddingGeo: false as boolean,
      showProgressDialog: false as boolean,
      progressMessage: '' as string,
      geoSearchModal: false as boolean,
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
      geoIsSelectable (geo: Geo): boolean {
        // Take advantage of JavaScript type coercion here
        return geo.geoType.canContainRespondent == <any>1 // eslint-disable-line
      },
      startMove (respondentGeo: RespondentGeo): Promise<void> {
        let p: any = null
        if (this.useCensusForm) {
          this.showProgressDialog = true
          this.progressMessage = 'Checking if move respondent census form exists...'
          p = CensusFormService.hasCensusForm(this.studyId, CensusTypes.move_respondent)
        } else {
          p = new Promise(resolve => {
            setTimeout(() => {
              resolve(false)
            }, 500)
          })
        }
        return p.then(hasMoveRespondentCensus => {
          if (hasMoveRespondentCensus) {
            this.progressMessage = 'Redirecting to move respondent census form...'
            setTimeout(() => {
              CensusFormService.redirectToCensusForm(this.studyId, CensusTypes.move_respondent, this.respondent.id)
            }, 1000)
          } else {
            this.movingRespondentGeo = respondentGeo
            this.geoSearchModal = true
          }
        }).finally(() => {
          this.showProgressDialog = false
        })
      },
      moveGeo (respondentGeo: RespondentGeo, geo): Promise<void> {
        debugger
        return RespondentService.moveRespondentGeo(this.respondent.id, respondentGeo.id, geo.id).then(resGeo => {
          let index = this.respondent.geos.findIndex(rg => rg.id === respondentGeo.id)
          this.respondent.geos.splice(index, 1, resGeo)
          this.$emit('after-move', resGeo)
        })
      },
      addGeo (geo: Geo): Promise<void> {
        return RespondentService.addRespondentGeo(this.respondent.id, geo.id).then(resGeo => {
          this.respondent.geos.push(resGeo)
          this.$emit('after-add', resGeo)
        })
      },
      remove (respondentGeoId: string): Promise<void> {
        return RespondentService.removeRespondentGeo(this.respondent.id, respondentGeoId).then(() => {
          let index = this.respondent.geos.findIndex(g => g.id === respondentGeoId)
          let rm = this.respondent.geos.splice(index, 1)
          this.$emit('after-remove', rm[0])
        })
      },
      async geoSelected (geos: Geo[]): Promise<void> {
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
      locations (): RespondentGeo[] {
        return this.respondent.geos.map(rGeo => rGeo)
      }
    }
  })
</script>

<style scoped>

</style>
