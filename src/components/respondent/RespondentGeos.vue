<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('locations') }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip left>
        <v-btn
          slot="activator"
          icon
          @click="isAddingGeo = true">
          <v-icon>add</v-icon>
        </v-btn>
        <span>{{ $t('add_locations') }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-alert v-show="error" color="error">{{error}}</v-alert>
    <v-data-table
      disable-initial-sort
      class="mb-3"
      :headers="locationHeaders"
      :items="locations"
      hide-actions>
      <template slot="items" slot-scope="props">
        <respondent-geo-row
          @remove="remove"
          @move="startMove"
          @overrideCurrent="toggleIsCurrent(props.item)"
          :show-history="!!props.item.history && !!props.item.history.length"
          :show-controls="true"
          v-model="props.expanded"
          :respondent-geo="props.item"></respondent-geo-row>
      </template>
      <template slot="expand" slot-scope="props">
        <v-data-table
          disable-initial-sort
          :headers="locationHeaders"
          :items="props.item.history"
          hide-actions>
          <template slot="items" slot-scope="historyProps">
            <RespondentGeoRow :respondentGeo="historyProps.item"></RespondentGeoRow>
          </template>
        </v-data-table>
      </template>
    </v-data-table>
    <add-respondent-geo-form
      v-model="isAddingGeo"
      @added="doneAddingGeo"
      :geoSelectionFilter="geoSelectionFilter"
      :respondent="respondent"></add-respondent-geo-form>
    <move-respondent-geo-form
      v-if="isMovingGeo"
      v-model="isMovingGeo"
      @done="doneMovingGeo"
      :geoSelectionFilter="geoSelectionFilter"
      :respondent-geo="movingRespondentGeo"
      :respondent="respondent"></move-respondent-geo-form>
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
  import { checkForCensusForm } from '../CensusFormChecker'

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
      },
      geoSelectionFilter: {
        default: true
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
      async toggleIsCurrent (respondentGeo: RespondentGeo) {
        const isCurrent = !respondentGeo.isCurrent
        try {
          const rg = await RespondentService.editRespondentGeo(respondentGeo.respondentId, respondentGeo.id, isCurrent)
          const index = this.respondent.geos.indexOf(respondentGeo)
          if (index > -1) {
            this.respondent.geos.splice(index, 1, rg)
          }
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to update current location')
          }
        }
      },
      geoIsSelectable (geo: Geo): boolean {
        // Take advantage of JavaScript type coercion here
        return geo.geoType.canContainRespondent == <any>1 // eslint-disable-line
      },
      startMove (respondentGeo: RespondentGeo): Promise<void> {
        if (this.useCensusForm) {
          return checkForCensusForm(CensusTypes.move_respondent, this.global.study.id, this.respondent.id).then(hasCensusForm => {
            // Implicit redirect to existing census form so we don't redirect here... This is a dumb way to do this.
            if (!hasCensusForm) {
              this.movingRespondentGeo = respondentGeo
              this.isMovingGeo = true
            }
          })
        } else {
          this.movingRespondentGeo = respondentGeo
          this.isMovingGeo = true
        }
      },
      doneMovingGeo (oldGeo: RespondentGeo, newGeo: RespondentGeo) {
        this.respondent.geos.push(newGeo)
        this.$emit('after-move', newGeo)
        this.isMovingGeo = false
      },
      doneAddingGeo (rGeo: RespondentGeo) {
        this.respondent.geos.push(rGeo)
        this.$emit('after-add', rGeo)
      },
      async remove (respondentGeoId: string): Promise<void> {
        if (!confirm(this.$t('confirm_delete_geo') + '')) return
        try {
          await RespondentService.removeRespondentGeo(this.respondent.id, respondentGeoId)
          let index = this.respondent.geos.findIndex(g => g.id === respondentGeoId)
          let rm = this.respondent.geos.splice(index, 1)
          this.$emit('after-remove', rm[0])
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      }
    },
    computed: {
      locations (): RespondentGeo[] {
        for (let rGeo of this.respondent.geos) {
          rGeo.history = []
        }
        let rootNodes = []
        let tailNodes = this.respondent.geos.filter((node) => {
          return node.previousRespondentGeoId === null
        })

        for (let node of tailNodes) {
          rootNodes.push(buildNodeHistory(node, this.respondent.geos))
        }
        return rootNodes
      }
    }
  })

  function buildNodeHistory(curNode, nodes) {
    let nextNode = nodes.find((n) => {
      return n.previousRespondentGeoId === curNode.id
    })
    if (nextNode === undefined) {
      // Found the root node, return it
      return curNode
    } else {
      nextNode.history = [curNode].concat(curNode.history)
      return buildNodeHistory(nextNode, nodes)
    }
  }
</script>

<style lang="sass">
  .main-column
    width: 90%
  .no-wrap-table
    td:not(:first-child)
      white-space: nowrap
</style>
