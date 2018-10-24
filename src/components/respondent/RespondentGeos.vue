<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('locations') }}</v-toolbar-title>
      <v-spacer />
      <permission :role-whitelist="['admin','manager']">
        <v-tooltip left>
          <v-btn
            slot="activator"
            icon
            @click="isAddingGeo = true">
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
        <RespondentGeoRow
          @remove="remove"
          @move="startMove"
          :showHistory="!!props.item.history && !!props.item.history.length"
          :showControls="true"
          v-model="props.expanded"
          :respondentGeo="props.item" />
      </template>
      <template slot="expand" slot-scope="props">
        <v-data-table
          disable-initial-sort
          :headers="locationHeaders"
          :items="props.item.history"
          hide-actions>
          <template slot="items" slot-scope="historyProps">
            <RespondentGeoRow :respondentGeo="historyProps.item" />
          </template>
        </v-data-table>
      </template>
    </v-data-table>
    <AddRespondentGeoForm
      v-model="isAddingGeo"
      @added="doneAddingGeo"
      :respondent="respondent"/>
    <MoveRespondentGeoForm
      v-if="isMovingGeo"
      v-model="isMovingGeo"
      @done="doneMovingGeo"
      :respondentGeo="movingRespondentGeo"
      :respondent="respondent"/>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import GeoSearch from '../geo/GeoSearch'
  // @ts-ignore
  import Permission from '../Permission'
  // @ts-ignore
  import RespondentGeoRow from './RespondentGeoRow'
  // @ts-ignore
  import AddRespondentGeoForm from './AddRespondentGeoForm'
  // @ts-ignore
  import MoveRespondentGeoForm from './MoveRespondentGeoForm'
  // @ts-ignore
  import {checkForCensusForm} from '../CensusFormChecker'

  import RespondentService from '../../services/respondent/RespondentService'
  import CensusTypes from '../../static/census.types'
  import Respondent from '../../entities/trellis/Respondent'
  import RespondentGeo from '../../entities/trellis/RespondentGeo'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import singleton from '../../static/singleton'

  export default Vue.extend({
    components: {GeoSearch, Permission, RespondentGeoRow, AddRespondentGeoForm, MoveRespondentGeoForm},
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
      isMovingGeo: false as boolean,
      showProgressDialog: false as boolean,
      progressMessage: '' as string,
      geoSearchModal: false as boolean,
      movingRespondentGeo: null,
      error: null,
      locationHeaders: [{
        text: ' ',
        value: 'history',
        class: 'actions',
        sortable: false,
      }, {
        text: 'Name',
        value: 'translated',
        class: 'main-column',
        sortable: false
      }, {
        text: 'Type',
        value: 'geoType'
      }, {
        text: 'Current',
        value: 'isCurrent'
      }, {
        text: '',
        value: 'edit',
        class: 'actions',
        sortable: false
      }]
    }),
    methods: {
      geoIsSelectable (geo: Geo): boolean {
        // Take advantage of JavaScript type coercion here
        return geo.geoType.canContainRespondent == <any>1 // eslint-disable-line
      },
      startMove (respondentGeo: RespondentGeo): Promise<void> {
        return checkForCensusForm(CensusTypes.move_respondent, this.global.study.id, this.respondent.id).then(hasCensusForm => {
          // Implicit redirect to existing census form so we don't redirect here... This is a dumb way to do this.
          if (!hasCensusForm) {
            this.movingRespondentGeo = respondentGeo
            this.isMovingGeo = true
          }
        })
      },
      moveGeo (respondentGeo: RespondentGeo, geo: Geo): Promise<void> {
        return RespondentService.moveRespondentGeo(this.respondent.id, respondentGeo.id, geo.id).then(resGeo => {
          let index = this.respondent.geos.findIndex(rg => rg.id === respondentGeo.id)
          this.respondent.geos.push(resGeo)
          this.$emit('after-move', resGeo)
        })
      },
      doneMovingGeo (oldGeo: RespondentGeo, newGeo: RespondentGeo) {
        this.respondent.geos.push(newGeo)
        this.$emit('afterMove', newGeo)
        this.isMovingGeo = false
      },
      doneAddingGeo (rGeo: RespondentGeo) {
        this.respondent.geos.push(rGeo)
        this.$emit('after-add', rGeo)
      },
      remove (respondentGeoId: string): Promise<void> {
        if (!confirm('Are you sure you want to delete this respondent geo?')) return
        return RespondentService.removeRespondentGeo(this.respondent.id, respondentGeoId).then(() => {
          let index = this.respondent.geos.findIndex(g => g.id === respondentGeoId)
          let rm = this.respondent.geos.splice(index, 1)
          this.$emit('after-remove', rm[0])
        })
      }
    },
    computed: {
      locations (): RespondentGeo[] {
        // TODO: Build the inverted tree structure correctly
        // let tree = arrayToTree(this.respondent.geos, 'id','previousRespondentGeoId')
        // tree = invertTree(tree)
        let relationShipCounts: {[id: string]: number} = {}
        for (let rGeo of this.respondent.geos) {
          if (!relationShipCounts.hasOwnProperty(rGeo.previousRespondentGeoId)) {
            relationShipCounts[rGeo.previousRespondentGeoId] = 0
          }
          relationShipCounts[rGeo.previousRespondentGeoId]++
        }
        let tree = []
        for (let rGeo of this.respondent.geos) {
          if (!relationShipCounts[rGeo.id]) {
            rGeo.history = []
            tree.push(rGeo)
            console.log(rGeo.id, rGeo.geoId)
            // console.log(rGeo.geo.nameTranslation.translationText[0])
          }
        }
        console.log('tree', JSON.stringify(tree, null, 2))
        return tree
      }
    }
  })
</script>

<style lang="sass">
  .main-column
    width: 90%
  td:not(:first-child)
    white-space: nowrap
</style>
