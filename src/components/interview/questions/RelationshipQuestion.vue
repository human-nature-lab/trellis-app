<template>
  <v-flex class="relationship">
    <div class="error" v-if="error">
      {{error}}
    </div>
    <v-chip
      :close="!edge.isLoading && !isQuestionDisabled"
      @input="remove(edge.id)"
      :id="edge.id"
      :key="edge.id"
      v-for="edge in edges">
      <v-avatar v-if="!edge.isLoading">
        <Photo
          :photo="edge.targetRespondent.photos.length ? edge.targetRespondent.photos[0] : null"
          :showAlt="false"
          :width="20"
          :height="20"/>
      </v-avatar>
      <v-avatar v-if="edge.isLoading">
        <v-progress-circular indeterminate color="primary" />
      </v-avatar>
      {{edge.isLoading ? 'Loading...' : edge.targetRespondent.name}}
    </v-chip>
    <v-btn
      :disabled="isQuestionDisabled"
      @click="showRespondentSearch()">
      {{ $t('add_relationship') }}
    </v-btn>
    <v-dialog
      lazy
      v-model="respondentSearchDialog">
      <v-card>
        <RespondentsSearch
          :canSelect="true"
          :limit="selectLimit"
          :shouldUpdateRoute="false"
          :canAddRespondent="canAddRespondent"
          @selected="onSelected"
          @respondentAdded="onOtherRespondentAdded"
          :respondentId="respondent.id"
          :formsButtonVisible="false"
          :baseFilters="baseRespondentFilters"
          :selectedRespondents="selectedRespondents"
          :canRemoveGeos="false"
          :isLoading="isSavingEdges" />
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import ActionTypes from '../../../static/action.types'
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ActionMixin from '../mixins/ActionMixin'
  import Photo from '../../Photo'
  import RespondentsSearch from '../../respondent/RespondentsSearch'
  import EdgeService from '../../../services/edge/EdgeService'
  import parameterTypes from '../../../static/parameter.types'
  import GeoService from '../../../services/geo/GeoService'
  export default {
    name: 'relationship-question',
    props: {
      respondent: {
        type: Object,
        required: true
      },
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, ActionMixin],
    data: function () {
      return {
        respondentSearchDialog: false,
        loadedEdges: {},
        error: null,
        isSavingEdges: false,
        baseAncestorId: null
      }
    },
    computed: {
      canAddRespondent () {
        const hasFalseParam = this.question.questionParameters.findIndex(p => {
          return p.parameter.name === 'can_add_respondent' && parseInt(p.val, 10) === 0
        }) > -1
        return !hasFalseParam
      },
      currentGeo () {
        return this.respondent.geos.find(geo => geo.pivot.is_current)
      },
      geoTypeParameterValue () {
        let geoTypeParameter = this.question.questionParameters.find(p => parseInt(p.parameterId, 10) === parameterTypes.geo_type)
        return geoTypeParameter ? geoTypeParameter.val : null
      },
      baseRespondentFilters () {
        let filters = {
          include_children: true
        }
        if (this.geoTypeParameterValue) {
          filters.geos = [this.baseAncestorId]
        }
        return filters
      },
      edgeIds: function () {
        return this.question.datum.data.map(d => d.edgeId)
      },
      edges: function () {
        let toLoad = []
        let edges = this.edgeIds.map(id => {
          if (this.loadedEdges[id]) {
            return this.loadedEdges[id]
          } else {
            toLoad.push(id)
            return {id: id, isLoading: true}
          }
        })
        this.loadEdges(toLoad)
        return edges
      },
      selectedRespondents: function () {
        console.log('recalculating selected respondents')
        return this.edges.map(edge => {
          return edge.targetRespondentId
        })
      },
      selectLimit: function () {
        for (let p of this.question.questionParameters) {
          if (p.parameter.name === 'max_relationships') {
            return parseInt(p.val, 10)
          }
        }
        return 0
      }
    },
    methods: {
      showRespondentSearch () {
        let promise = new Promise(resolve => resolve())
        if (this.geoTypeParameterValue && !this.baseAncestorId) {
          promise = GeoService.getGeoAncestors(this.currentGeo.id).then(ancestors => {
            let geoTypeCompareVal = this.geoTypeParameterValue.replace(' ', '').toLowerCase()
            let baseAncestor = ancestors.find(a => a.geo_type.name.replace(' ', '').toLowerCase() === geoTypeCompareVal)
            if (!baseAncestor) console.warn('Unable to find respondent ancestor matching', this.geoTypeParameterValue)
            this.baseAncestorId = baseAncestor ? baseAncestor.id : null
          })
        }
        promise.then(() => {
          this.respondentSearchDialog = true
        })
      },
      loadEdges: function (edgeIds) {
        if (!edgeIds.length) return
        EdgeService.getEdges(edgeIds)
          .then(edges => {
            for (let edge of edges) {
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
          edge_id: edgeId
        })
      },
      remove: function (edgeId) {
        this.action(ActionTypes.remove_edge, {
          edge_id: edgeId
        })
      },
      onOtherRespondentAdded (respondent) {
        this.action(ActionTypes.other_respondent_added, {
          respondent_id: respondent.id
        })
      },
      onSelected: function (added, removed) {
        this.isSavingEdges = true
        EdgeService.createEdges(added.map(id => ({
          source_respondent_id: this.respondent.id,
          target_respondent_id: id
        }))).then(edges => {
          for (let edge of edges) {
            this.$set(this.loadedEdges, edge.id, edge)
          }
          for (let edge of edges) {
            this.add(edge.id)
          }
          for (let respondentId of removed) {
            let edge = this.edges.find(edge => edge.targetRespondentId === respondentId)
            this.remove(edge.id)
          }
        }).catch(err => {
          console.error(err)
          this.error = err
        }).then(() => {
          this.isSavingEdges = false
          this.respondentSearchDialog = false
        })
      }
    },
    created: function () {
      this.loadEdges(this.edgeIds)
    },
    components: {
      Photo,
      RespondentsSearch
    }
  }
</script>

<style lang="sass" scoped>
.avatar
  overflow: hidden
</style>
