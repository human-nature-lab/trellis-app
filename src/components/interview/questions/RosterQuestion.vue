<template>
  <v-flex xs12 sm12 md6 class="roster-question">
    <v-card>
      <v-list>
        <v-list-tile v-for="row in roster" :key="row.id">
          <v-list-tile-content>
            <span class="roster-val">{{row.val}}</span>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon color="grey">mode_edit</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile v-if="isAddingNew">
          <v-text-field
            placeholder="Roster text here"
            v-model="newText"
            @blur="onNewBlur"/>
        </v-list-tile>
      </v-list>
      <v-btn
        @click="isAddingNew = true"
        color="deep-orange"
        dark
        absolute
        bottom
        right
        fab>
        <v-icon>add</v-icon>
      </v-btn>
    </v-card>
  </v-flex>
</template>

<script>
  import actionBus from '../services/ActionBus'
  export default {
    name: 'roster-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        isAddingNew: false,
        newText: null,
        editing: []
      }
    },
    methods: {
      onNewBlur: function () {
        actionBus.$emit('action', {
          action_type: 'add-roster-row',
          payload: {
            roster_text: this.newText
          }
        })
        this.newText = null
        this.isAddingNew = false
      },
      onRowBlur: function (row) {}
    },
    computed: {
      roster: function () {
        if (this.question.data) {
          return this.question.datum.sort(function (a, b) {
            return a.sort_order > b.sort_order
          })
        } else {
          return []
        }
      }
    }
  }
</script>

<style scoped>

</style>
