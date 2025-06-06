<template>
  <v-col class="pa-0">
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('locations') }}</v-toolbar-title>
      <v-spacer />
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-on="on"
            v-bind="attrs"
            @click="isAddingGeo = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('add_locations') }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-alert v-show="error" color="error">{{error}}</v-alert>
    <v-data-table
      sort-by="translated"
      class="mb-4"
      :headers="locationHeaders"
      :items="locations"
      :items-per-page="-1"
      hide-default-footer>
      <template v-slot:item="props">
        <RespondentGeoRow
          @remove="remove"
          @move="startMove"
          @overrideCurrent="toggleIsCurrent(props.item)"
          :show-history="!!props.item.history && !!props.item.history.length"
          :show-controls="true"
          :value="props.isExpanded"
          @input="props.expand($event)"
          :respondent-geo="props.item" />
      </template>
      <template v-slot:expanded-item="props">
        <tr>
          <td colspan="4">
            <v-data-table
              sort-by="translated"
              :headers="locationHeaders"
              :items="props.item.history"
              hide-default-footer>
              <template v-slot:item="historyProps">
                <RespondentGeoRow colspan="4" :respondentGeo="historyProps.item"></RespondentGeoRow>
              </template>
            </v-data-table>
          </td>
        </tr>
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
  </v-col>
</template>

<script lang="ts">
  import Vue from 'vue'
  import GeoSearch from '@/components/geo/GeoSearch.vue'
  import Permission from '../Permission.vue'
  import RespondentGeoRow from './RespondentGeoRow.vue'
  import AddRespondentGeoForm from './AddRespondentGeoForm.vue'
  import MoveRespondentGeoForm from './MoveRespondentGeoForm.vue'
  import RespondentService from '@/services/respondent'
  import censusTypes from '@/static/census.types'
  import Respondent from '@/entities/trellis/Respondent'
  import RespondentGeo from '@/entities/trellis/RespondentGeo'
  import Geo from '@/entities/trellis/Geo'
  import singleton from '@/static/singleton'
  import { checkForCensusForm } from '../CensusFormChecker.vue'

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
          return checkForCensusForm(censusTypes.move_respondent, this.global.study.id, this.respondent.id).then(hasCensusForm => {
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
