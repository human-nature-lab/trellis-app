<template>
  <v-flex xs12 sm12 md6 class="roster-question">
    <v-card>
      <v-list>
        <v-list-tile v-for="(row, rowIndex) in roster" :key="row.id">
          <v-list-tile-content>
            <v-text-field
              :disabled="isQuestionDisabled"
              placeholder="Roster text here"
              v-model="newText"
              v-if="rowIndex === editingIndex"
              autofocus
              @blur="onStopEdit(rowIndex)"/>
            <span class="old-val"
              v-if="rowIndex === editingIndex">({{oldText}})</span>
            <span class="roster-val"
              v-if="rowIndex !== editingIndex">{{row.val}}</span>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon
                   ripple
                   :disabled="isQuestionDisabled"
                   @click="onStartEdit(rowIndex)">
              <v-icon color="grey">mode_edit</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-btn
        @click="onNewRow"
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
        isAddingNew: false,
        _newText: null,
        oldText: null,
        editingIndex: null
      }
    },
    methods: {
      onNewRow: function () {
        this.editingIndex = this.question.datum.data.length
        actionBus.action({
          action_type: 'new-roster-row',
          question_datum_id: this.question.datum.id,
          payload: {
            sort_order: this.question.datum.data.length
          }
        })
        this.onStartEdit(this.editingIndex)
      },
      onStartEdit: function (rowIndex) {
        let roster = this.getRoster()
        this.editingIndex = rowIndex
        this.oldText = roster[rowIndex].val
        this.newText = roster[rowIndex].val
        this.$forceUpdate()
      },
      onStopEdit: function (rowIndex) {
        this.editingIndex = ''
        this.newText = ''
        this.$forceUpdate()
      },
      getRoster: function () {
        if (this.question.datum.data) {
          return this.question.datum.data.sort(function (a, b) {
            return a.sort_order > b.sort_order
          })
        } else {
          return []
        }
      }
    },
    computed: {
      newText: {
        get: function () {
          return this._newText
        },
        set: function (newText) {
          actionBus.actionDebounce({
            action_type: 'roster-row-edit',
            question_datum_id: this.question.datum.id,
            payload: {
              datum_id: this.roster[this.editingIndex].id,
              val: newText
            }
          })
          this._newText = newText
        }
      },
      roster: function () {
        return this.getRoster()
      }
    }
  }
</script>

<style scoped>

</style>
