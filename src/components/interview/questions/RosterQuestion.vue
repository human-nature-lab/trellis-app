<template>
  <v-flex xs12 class="roster-question">
    <v-card class="roster">
      <v-list>
        <v-list-item
          :data-id="row.id"
          v-for="(row, rowIndex) in roster"
          :key="row.id">
          <v-list-item-avatar>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-on="on"
                  v-bind="attrs"
                  icon
                  v-if="editingIndex === rowIndex"
                  :disabled="isSavingEdit || isQuestionDisabled"
                  @click="stopEditingAndRevert(row, rowIndex)">
                  <v-icon color="red">mdi-clear</v-icon>
                </v-btn>
              </template>
              <span>
                {{ $t('revert_changes') }}
              </span>
            </v-tooltip>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-text-field
              :disabled="isQuestionDisabled"
              :placeholder="oldText"
              v-model="newText"
              v-if="rowIndex === editingIndex"
              autofocus
              :append-icon="barcodeIcon"
              @click:append="scanBarcode"
              @keyup.enter="stopEditingAndSave(row, rowIndex)"
              @keyup.esc.stop="stopEditingAndRevert(row, rowIndex)" />
            <span class="roster-val"
              v-if="rowIndex !== editingIndex">{{row.val}}</span>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu
              v-if="!isSavingEdit && !row.isLoading && rowIndex !== editingIndex"
              :disabled="editingIndex > 0 || isQuestionDisabled"
              left
              :nudge-left="30">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-on="on" v-bind="attrs">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-on="on"
                        v-bind="attrs"
                        icon
                        @click="startEditingRow(row, rowIndex)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>
                      {{ $t('select_to_edit') }}
                    </span>
                  </v-tooltip>
                </v-list-item>
                <v-list-item>
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-on="on"
                        v-bind="attrs"
                        icon
                        @click="removeRosterRow(row)">
                        <v-icon color="red">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('delete') }}</span>
                  </v-tooltip>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-on="on"
                  v-bind="attrs"
                  v-if="editingIndex === rowIndex"
                  icon
                  :disabled="isQuestionDisabled"
                  @click.stop="stopEditingAndSave(row, rowIndex)">
                    <v-icon color="green">mdi-check</v-icon>
                </v-btn>
              </template>
              <span>
                {{ $t('save') }}
              </span>
            </v-tooltip>
                <v-progress-circular
              v-if="isSavingEdit || row.isLoading"
              indeterminate
              color="primary" />
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="isAddingNew">
          <v-list-item-avatar>
            <v-btn
              :disabled="isSavingNew"
              icon
              @click="stopAddingWithoutSaving">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-text-field
              :disabled="isQuestionDisabled"
              v-model="newText"
              autofocus
              @keyup.esc="stopAddingWithoutSaving"
              @keyup.enter="stopAddingAndSave"
              :append-icon="barcodeIcon"
              @click:append="scanBarcode"/>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              v-if="!isSavingNew"
              icon
              @click.stop="stopAddingAndSave">
              <v-icon color="green">mdi-check</v-icon>
            </v-btn>
            <v-progress-circular
              v-if="isSavingNew"
              indeterminate
              color="primary" />
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-fab-transition>
        <v-btn
          class="deep-orange"
          @click="isAddingNew=true"
          v-show="!isQuestionDisabled"
          fab
          dark
          absolute
          bottom
          right>
          <v-icon style="height:auto;">mdi-plus</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-card>
  </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import RosterService from '../../../services/roster'
  import ActionMixin from '../mixins/ActionMixin'
  import BarcodeMixin from '../mixins/BarcodeMixin'
  import AT from '../../../static/action.types'
  export default {
    name: 'roster-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin, ActionMixin, BarcodeMixin],
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
    methods: {
      async scanBarcode () {
        this.newText = await this.scan()
      },
      startEditingRow (row, index) {
        this.newText = row.val
        this.oldText = row.val
        this.editingIndex = index
      },
      stopEditingAndSave (row, index) {
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
      stopEditingAndRevert (row, index) {
        row.val = this.oldText
        this.oldText = null
        this.newText = null
        this.editingIndex = -1
      },
      stopAddingWithoutSaving () {
        this.isSavingNew = false
        this.isAddingNew = false
        this.newText = null
        this.oldText = null
      },
      stopAddingAndSave () {
        this.isSavingNew = true
        RosterService.createRosterRows([this.newText]).then(rows => {
          for (let row of rows) {
            this.rosterCache[row.id] = row
            this.$nextTick(() => this.action(AT.add_roster_row, {
              roster_id: row.id,
              name: '',
              val: row.id
            }))
          }
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.isSavingNew = false
          this.isAddingNew = false
          this.newText = null
        })
      },
      removeRosterRow (row) {
        this.action(AT.remove_roster_row, {
          roster_id: row.id
        })
      },
      loadRosters (rosterRowIds, shouldLoadExisting = false) {
        if (!rosterRowIds.length) return
        if (!shouldLoadExisting) {
          rosterRowIds = rosterRowIds.filter(row => !this.rosterCache[row.id]) // Filter out previously loaded roster rows
        }
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
      rosterIds () {
        return this.question.datum.data.map(d => d.rosterId)
      },
      roster () {
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

<style lang="sass" scoped>
  .roster.card
    padding-bottom: 25px
    margin-bottom: 25px
</style>
