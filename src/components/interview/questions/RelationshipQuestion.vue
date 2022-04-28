<template>
  <v-flex class="relationship">
    <div
      class="error"
      v-if="error"
    >
      {{ error }}
    </div>
    <v-chip
      :close="!isQuestionDisabled"
      @click:close="remove(edge.id)"
      :id="edge.id"
      :key="edge.id"
      v-for="edge in edges"
    >
      <v-avatar v-if="!edge.isLoading">
        <Photo
          :photo="edge.targetRespondent.photos.length ? edge.targetRespondent.photos[0] : null"
          :show-alt="false"
          immediate
          width="20"
          height="20"
        />
      </v-avatar>
      <v-avatar v-if="edge.isLoading">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </v-avatar>
      {{ edge.isLoading ? 'Loading...' : edge.targetRespondent.name }}
    </v-chip>
    <v-btn
      :disabled="isQuestionDisabled || isNoOneSelected"
      @click="showRespondentSearch()"
    >
      {{ $t('add_relationship') }}
    </v-btn>
    <v-btn
      v-if="showNoOne"
      :disabled="isQuestionDisabled || hasAddedRelationships"
      :class="{primary: isNoOneSelected}"
      @click="updateNoOne()"
    >
      {{ $t('no_one') }}
    </v-btn>
    <v-dialog
      v-model="respondentSearchDialog"
    >
      <ModalTitle
        :title="$t('respondent_search')"
        @close="respondentSearchDialog = false"
      />
      <v-card>
        <RespondentsSearch
          :can-select="true"
          :limit="selectLimit"
          :should-update-route="false"
          :can-add-respondent="canAddRespondent"
          @selected="onSelected"
          :on-respondent-added="onRespondentAdded"
          :respondent-id="respondent.id"
          :forms-button-visible="false"
          :base-filters="baseRespondentFilters"
          :selected-respondents="selectedRespondents"
          :can-remove-geos="false"
          :search-query="searchQuery"
          :is-loading="isSavingEdges"
        />
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import ActionTypes from '../../../static/action.types'
import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
import ActionMixin from '../mixins/ActionMixin'
import Photo from '../../photo/Photo.vue'
import RespondentsSearch from '../../respondent/RespondentsSearch.vue'
import ModalTitle from '../../ModalTitle.vue'
import EdgeService from '../../../services/edge'
import parameterTypes from '../../../static/parameter.types'
import GeoService from '../../../services/geo'
import { uniq } from 'lodash'

export default {
  name: 'RelationshipQuestion',
  props: {
    respondent: {
      type: Object,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
  },
  mixins: [QuestionDisabledMixin, ActionMixin],
  data: function () {
    return {
      respondentSearchDialog: false,
      loadedEdges: {},
      error: null,
      isSavingEdges: false,
      baseAncestorIds: [],
      searchQuery: undefined,
    }
  },
  computed: {
    canAddRespondent () {
      const hasFalseParam = this.question.questionParameters.findIndex(p => {
        return p.parameter.name === 'can_add_respondent' && parseInt(p.val, 10) === 0
      }) > -1
      return !hasFalseParam
    },
    showNoOne () {
      const hideNoOneIndex = this.question.questionParameters.findIndex(p => {
        return parseInt(p.parameterId, 10) === parameterTypes.hide_no_one && !!+p.val
      })
      return hideNoOneIndex === -1
    },
    currentGeo () {
      const rGeo = this.respondent.geos.find(geo => geo.isCurrent)
      return rGeo ? rGeo.geo : null
    },
    geoTypeParameterValue () {
      const geoTypeParameter = this.question.questionParameters.find(p => parseInt(p.parameterId, 10) === parameterTypes.geo_type)
      return geoTypeParameter ? geoTypeParameter.val : null
    },
    orConditionTagParameterValues () {
      const orConditionTagParameters = this.question.questionParameters.filter(p => parseInt(p.parameterId, 10) === parameterTypes.or_respondent_condition_tag)
      return orConditionTagParameters.map(ctp => ctp.val)
    },
    andConditionTagParameterValues () {
      const andConditionTagParameters = this.question.questionParameters.filter(p => parseInt(p.parameterId, 10) === parameterTypes.and_respondent_condition_tag)
      return andConditionTagParameters.map(ctp => ctp.val)
    },
    baseRespondentFilters () {
      const filters = {
        includeChildren: true,
        onlyCurrentGeo: false,
        randomize: true,
      }
      if (this.geoTypeParameterValue && this.baseAncestorIds.length) {
        filters.geos = this.baseAncestorIds.slice()
      }
      if (this.andConditionTagParameterValues.length > 0) {
        filters.conditionTags = this.andConditionTagParameterValues
      }
      if (this.orConditionTagParameterValues.length > 0) {
        filters.orConditionTags = this.orConditionTagParameterValues
      }
      return filters
    },
    edgeIds () {
      return this.question.datum.data.map(d => d.edgeId)
    },
    edges: function () {
      const toLoad = []
      const edges = this.edgeIds.map(id => {
        if (this.loadedEdges[id]) {
          return this.loadedEdges[id]
        } else {
          toLoad.push(id)
          return { id: id, isLoading: true }
        }
      })
      this.loadEdges(toLoad)
      return edges
    },
    selectedRespondents: function () {
      console.log('recalculating selected respondents')
      return this.edges.map(edge => {
        return edge.targetRespondent
      })
    },
    selectLimit: function () {
      for (const p of this.question.questionParameters) {
        if (p.parameter.name === 'max_relationships') {
          return parseInt(p.val, 10)
        }
      }
      return 0
    },
    isNoOneSelected () {
      return this.question.datum && this.question.datum.noOne
    },
    hasAddedRelationships () {
      return this.question.datum && this.question.datum.data.length > 0
    },
  },
  methods: {
    showRespondentSearch () {
      let promise = new Promise(resolve => resolve())
      if (this.geoTypeParameterValue && !this.baseAncestorIds.length && this.respondent.geos.length) {
        const p = []
        const geoTypeCompareVal = this.geoTypeParameterValue.replace(/\s/g, '').toLowerCase()
        for (const rGeo of this.respondent.geos) {
          // Restrict respondent geos to current geos
          if (rGeo.isCurrent) {
            p.push(GeoService.getGeoAncestors(rGeo.geoId).then(ancestors => {
              const baseAncestor = ancestors.find(a => a.geoType.name.replace(/\s/g, '').toLowerCase() === geoTypeCompareVal)
              if (!baseAncestor) console.warn('Unable to find respondent ancestor matching', this.geoTypeParameterValue)
              if (baseAncestor) {
                this.baseAncestorIds.push(baseAncestor.id)
              }
            }))
          }
        }
        promise = Promise.all(p)
      }
      promise.then(() => {
        // Remove duplicate IDs
        this.baseAncestorIds = uniq(this.baseAncestorIds)
        this.respondentSearchDialog = true
      })
    },
    loadEdges: function (edgeIds) {
      if (!edgeIds.length) return
      EdgeService.getEdges(edgeIds)
        .then(edges => {
          for (const edge of edges) {
            this.$set(this.loadedEdges, edge.id, edge)
          }
        })
        .catch(err => {
          console.error(err)
          this.error = err
        })
    },
    add: function (edgeId) {
      this.action(ActionTypes.add_edge, {
        name: this.question.varName,
        val: edgeId,
        edge_id: edgeId,
      })
    },
    remove: function (edgeId) {
      this.action(ActionTypes.remove_edge, {
        edge_id: edgeId,
      })
    },
    updateNoOne () {
      if (this.isNoOneSelected) {
        this.action(ActionTypes.deselect_no_one)
      } else {
        this.action(ActionTypes.select_no_one)
      }
    },
    async onRespondentAdded (respondent) {
      const edges = await EdgeService.createEdges([{
        source_respondent_id: this.respondent.id,
        target_respondent_id: respondent.id,
      }])
      this.add(edges[0].id)
    },
    onSelected: function (added, removed) {
      this.isSavingEdges = true
      EdgeService.createEdges(added.map(id => ({
        source_respondent_id: this.respondent.id,
        target_respondent_id: id,
      }))).then(edges => {
        for (const edge of edges) {
          this.$set(this.loadedEdges, edge.id, edge)
        }
        for (const edge of edges) {
          this.add(edge.id)
        }
        for (const respondentId of removed) {
          const edge = this.edges.find(edge => edge.targetRespondentId === respondentId)
          this.remove(edge.id)
        }
      }).catch(err => {
        console.error(err)
        this.error = err
      }).then(() => {
        this.isSavingEdges = false
        this.respondentSearchDialog = false
      })
    },
  },
  created: function () {
    this.loadEdges(this.edgeIds)
    /* TODO: How can we pass the $route.query.associatedRespondentName to prefil the respondent search dialog? */
    if (this.$route && this.$route.query && this.$route.query.associatedRespondentId) {
      this.searchQuery = this.$route.query.associatedRespondentName
      console.log('searchQuery', this.searchQuery)
      // this.showRespondentSearch()
      // Remove the associatedRespondentId from the queryString
      const query = Object.assign({}, this.$route.query)
      delete query.associatedRespondentId
      delete query.associatedRespondentName
      this.$router.replace({ query })
    }
  },
  components: {
    Photo,
    RespondentsSearch,
    ModalTitle,
  },
}
</script>

<style lang="sass" scoped>
.avatar
  overflow: hidden
.btn
  &.active
    background: orangered
    color: white
</style>
