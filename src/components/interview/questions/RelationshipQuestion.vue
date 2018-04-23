<template>
  <v-flex class="relationship">
    <div class="error">
      {{error}}
    </div>
    <v-chip
      close
      @input="remove(edge)"
      :key="edge.source_respondent_id+edge.target_respondent_id"
      v-for="edge in edges">
      <v-avatar>
        <Photo :photo="edge.target_respondent.photos[0]" />
      </v-avatar>
      {{edge.target_respondent.name}}
    </v-chip>
    <v-btn
      flat
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
    data: function () {
      return {
        respondentSearchDialog: false,
        edges: []
      }
    },
    computed: {
      edgeIds: function () {
        return this.question.datum.data.map(d => d.edge_id)
      }
    },
    methods: {
      loadEdges: function () {
        EdgeService.getEdges(this.edgeIds)
          .then(edges => {
            this.edges = this.edges.concat(edges)
          })
          .catch(err => {
            console.error(err)
            this.error = err
          })
      },
      remove: function (edge) {
        let index = this.edges.indexOf(edge)
        this.edges.splice(index, 1)
      },
      onSelected: function (selected) {
        EdgeService.createEdges(selected.map(respondent => ({
          source_respondent_id: this.interview.survey.respondent_id,
          target_respondent_id: respondent.id
        }))).then(res => {
          for (let edge of res.edges) {
            actionBus.action({
              action_type: 'add-edge',
              question_datum_id: this.question.datum.id,
              payload: {
                edge_id: edge.id
              }
            })
          }
          this.loadEdges()
        }).catch(err => {
          console.error(err)
          this.error = err
        }).then(() => {
          this.respondentSearchDialog = false
        })
      }
    },
    created: function () {
      this.loadEdges()
    },
    components: {
      Photo,
      RespondentsSearch
    }
  }
</script>

<style scoped>

</style>
