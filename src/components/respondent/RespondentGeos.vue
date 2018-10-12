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
  import RespondentService from '../../services/respondent/RespondentService'
  import CensusFormService from '../../services/census/index'
  import CensusTypes from '../../static/census.types'
  import Respondent from '../../entities/trellis/Respondent'
  import RespondentGeo from '../../entities/trellis/RespondentGeo'
  import Geo from '../../entities/trellis/Geo'
  import Vue from 'vue'
  import singleton from '../../static/singleton'
  import {arrayToTree} from 'performant-array-to-tree'
  export default Vue.extend({
    components: {GeoSearch, Permission, RespondentGeoRow, AddRespondentGeoForm},
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
        text: ' ',
        value: 'history',
        class: 'actions',
        sortable: false,
      }, {
        text: 'Name',
        value: 'translated',
        class: 'main-column'
      }, {
        text: 'Type',
        value: 'type'
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

      },
      moveGeo (respondentGeo: RespondentGeo, geo: Geo): Promise<void> {
        return RespondentService.moveRespondentGeo(this.respondent.id, respondentGeo.id, geo.id).then(resGeo => {
          let index = this.respondent.geos.findIndex(rg => rg.id === respondentGeo.id)
          this.respondent.geos.splice(index, 1, resGeo)
          this.$emit('after-move', resGeo)
        })
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
        const tree = arrayToTree(this.respondent.geos, 'id','previousRespondentGeoId')
        return tree.map(item => {
          item.data.history = item.children.map(d => d.data)
          return item.data
        })
      }
    }
  })
</script>

<style lang="sass">
  .main-column
    width: 50%
  td
    white-space: nowrap
</style>
