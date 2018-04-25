<template>
  <v-flex class="relationship">
    <div class="error" v-if="error">
      {{error}}
    </div>
    <v-chip
      :close="!edge.isLoading && !isQuestionDisabled"
      @input="remove(edge)"
      :id="edge.id"
      :key="edge.id"
      v-for="edge in edges">
      <v-avatar v-if="!edge.isLoading">
        <Photo :photo="edge.target_respondent.photos[0]" :showAlt="false"/>
      </v-avatar>
      <v-avatar v-if="edge.isLoading">
        <v-progress-circular indeterminate color="primary" />
      </v-avatar>
      {{edge.isLoading ? 'Loading...' : edge.target_respondent.name}}
    </v-chip>
    <v-btn
      :disabled="isQuestionDisabled"
      @click="respondentSearchDialog = true">
      Add Relationship
    </v-btn>
    <v-dialog v-model="respondentSearchDialog">
      <v-card>
        <RespondentsSearch @selected="onSelected" />
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import Photo from '@/components/Photo'
  import RespondentsSearch from '@/components/RespondentsSearch'
  import EdgeService from '@/services/edge/EdgeService'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'relationship-question',
    props: {
      interview: {
        type: Object,
        required: true
      },
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin],
    data: function () {
      return {
        respondentSearchDialog: false,
        loadedEdges: {},
        error: null
      }
    },
    computed: {
      edgeIds: function () {
        return this.question.datum.data.map(d => d.edge_id)
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
      }
    },
    methods: {
      loadEdges: function (edgeIds) {
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
      remove: function (edge) {
        actionBus.action({
          action_type: 'remove-edge',
          question_datum_id: this.question.datum.id,
          payload: {
            edge_id: edge.id
          }
        })
      },
      onSelected: function (selected) {
        EdgeService.createEdges(selected.map(respondent => ({
          source_respondent_id: this.interview.survey.respondent_id,
          target_respondent_id: respondent.id
        }))).then(edges => {
          for (let edge of edges) {
            actionBus.action({
              action_type: 'add-edge',
              question_datum_id: this.question.datum.id,
              payload: {
                name: this.question.var_name,
                val: edge.id,
                edge_id: edge.id
              }
            })
            this.$set(this.loadedEdges, edge.id, edge)
          }
        }).catch(err => {
          console.error(err)
          this.error = err
        }).then(() => {
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

<style scoped>

</style>
