<template>
  <v-flex xs12 class="roster-question">
    <v-card>
      <v-list>
        <v-list-tile
          v-for="(row, rowIndex) in roster"
          :key="row.id">
          <v-list-tile-avatar>
            <v-btn
              icon
              v-if="editingIndex === rowIndex"
              :disabled="isSavingEdit"
              @click="stopAddingWithoutSaving(row, rowIndex)">
              <v-icon color="red">clear</v-icon>
            </v-btn>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-text-field
              :disabled="isQuestionDisabled"
              :placeholder="oldText"
              v-model="newText"
              v-if="rowIndex === editingIndex"
              autofocus
              @keyup.enter="stopEditingAndSave(row, rowIndex)"
              @keyup.esc="stopAddingWithoutSaving(row, rowIndex)" />
            <span class="roster-val"
              v-if="rowIndex !== editingIndex">{{row.val}}</span>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-menu
              v-if="!isSavingEdit && !row.isLoading && rowIndex !== editingIndex"
              :disabled="editingIndex > 0"
              left
              lazy
              :nudge-left="30">
              <v-btn icon slot="activator">
                <v-icon>more_vert</v-icon>
              </v-btn>
              <v-list>
                <v-list-tile>
                  <v-btn icon @click="startEditingRow(row, rowIndex)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                </v-list-tile>
                <v-list-tile>
                  <v-btn icon @click="removeRosterRow(row)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-list-tile>
              </v-list>
            </v-menu>
            <v-btn
              v-if="editingIndex === rowIndex"
              icon
              color="green"
              @click.stop="stopEditingAndSave(row, rowIndex)">
              <v-icon>check</v-icon>
            </v-btn>
            <v-progress-circular
              v-if="isSavingEdit || row.isLoading"
              indeterminate
              color="primary" />
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="isAddingNew">
          <v-list-tile-avatar>
            <v-btn
              :disabled="isSavingNew"
              color="error"
              icon
              @click="stopAddingWithoutSaving">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-text-field
              :disabled="isQuestionDisabled"
              placeholder="Roster value here..."
              v-model="newText"
              autofocus
              @keyup.esc="stopAddingWithoutSaving"
              @keyup.enter="stopAddingAndSave" />
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              v-if="!isSavingNew"
              color="success"
              icon
              @click.stop="stopAddingAndSave">
              <v-icon>check</v-icon>
            </v-btn>
            <v-progress-circular
              v-if="isSavingNew"
              indeterminate
              color="primary" />
          </v-list-tile-action>
        </v-list-tile>

      </v-list>
      <v-btn
        @click="isAddingNew=true"
        :disabled="isQuestionDisabled"
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
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import RosterService from '@/services/roster/RosterService'
  import actionBus from '../services/ActionBus'
  export default {
    name: 'roster-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin],
    data: function () {
      return {
        rosterCache: {},
        isAddingNew: false,
        isSavingNew: false,
        isSavingEdit: false,
        newText: null,
        oldText: null,
        editingIndex: -1
      }
    },
    created: function () {
      this.loadRosters(this.rosterIds)
    },
    updated: function () {
      this.loadRosters(this.rosterIds)
    },
    methods: {
      startEditingRow: function (row, index) {
        this.newText = row.val
        this.oldText = row.val
        this.editingIndex = index
      },
      stopEditingAndSave: function (row, index) {
        this.isSavingEdit = true
        row.val = this.newText
        RosterService.editRosterRow(row).then(newRow => {
          this.$set(this.rosterCache, newRow.id, newRow)
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isSavingEdit = false
          this.oldText = null
          this.newText = null
          this.editingIndex = -1
        })
      },
      stopEditingAndRevert: function (row, index) {
        row.val = this.oldText
        this.oldText = null
        this.newText = null
        this.editingIndex = -1
      },
      stopAddingWithoutSaving: function () {
        this.isSavingNew = false
        this.isAddingNew = false
        this.newText = null
        this.oldText = null
      },
      stopAddingAndSave: function () {
        this.isSavingNew = true
        RosterService.createRosterRows([this.newText]).then(rows => {
          for (let row of rows) {
            actionBus.action({
              action_type: 'add-roster-row',
              question_datum_id: this.question.datum.id,
              payload: {
                roster_id: row.id
              }
            })
            this.$set(this.rosterCache, row.id, row)
          }
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isSavingNew = false
          this.isAddingNew = false
          this.newText = null
        })
      },
      removeRosterRow: function (row) {
        actionBus.action({
          action_type: 'remove-roster-row',
          question_datum_id: this.question.datum.id,
          payload: {
            roster_id: row.id
          }
        })
      },
      loadRosters: function (rosterRowIds) {
        RosterService.getRosterRows(rosterRowIds).then(rosterRows => {
          for (let row of rosterRows) {
            this.$set(this.rosterCache, row.id, row)
          }
        }).catch(err => {
          this.error = err
        })
      }
    },
    computed: {
      rosterIds: function () {
        return this.question.datum.data.map(datum => datum.roster_id)
      },
      roster: function () {
        console.log('recalculating roster values')
        let toLoad = []
        let rows = this.rosterIds.map(id => {
          if (this.rosterCache[id]) {
            return this.rosterCache[id]
          } else {
            return {id: id, val: 'Loading...', isLoading: true}
          }
        })
        this.loadRosters(toLoad)
        return rows
      }
    }
  }
</script>

<style scoped>

</style>
