<template>
  <v-flex>
    <v-layout row>
      <v-btn
        v-bind:class="{'primary': dk}"
        @click="dk=!dk">Don't know</v-btn>
      <v-btn
        v-bind:class="{'primary': rf}"
        @click="rf=!rf">Refuse</v-btn>
    </v-layout>
    <v-layout v-if="shouldShowReason">
      <v-text-field
        name="Reason"
        label="Reason"
        :rules="rules"
        v-model="reason"
        required
        autofocus />
    </v-layout>
  </v-flex>
</template>

<script>
  import actionBus from './services/ActionBus'
  export default {
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    name: 'dont-know-refused',
    data: function () {
      return {
        _reason: this.question.datum.dk_rf_val,
        rules: [value => !!value || 'Reason is required.']
      }
    },
    created: function () {
      this._reason = this.question.datum.dk_rf_val // We're actually binding to a text model so here we need to initialize that var
    },
    computed: {
      shouldShowReason: function () {
        return this.question.datum.dk_rf !== null && this.question.datum.dk_rf !== undefined
      },
      reason: {
        get: function () {
          return this.question.datum.dk_rf_val
        },
        set: function (val) {
          this._reason = val
          actionBus.actionDebounce({
            action_type: 'dk-rf-val',
            question_id: this.question.id,
            payload: {
              dk_rf_val: val
            }
          })
        }
      },
      dk: {
        get: function () {
          if (this.question.datum.dk_rf === null) {
            return false
          } else {
            return this.question.datum.dk_rf
          }
        },
        set: function (val) {
          actionBus.action({
            action_type: 'dk-rf',
            question_id: this.question.id,
            payload: {
              dk_rf: val ? true : this.rf ? false : null
            }
          })
        }
      },
      rf: {
        get: function () {
          if (this.question.datum.dk_rf === null) {
            return false
          } else {
            return !this.question.datum.dk_rf
          }
        },
        set: function (val) {
          actionBus.$emit('action', {
            action_type: 'dk-rf',
            question_id: this.question.id,
            payload: {
              dk_rf: val === false ? null : false
            }
          })
        }
      }
    }
  }
</script>

<style lang="sass" scoped>
  .theme--light
    button
      font-size: 12px
      &.btn.btn-selected
        background: orangered
        color: white
</style>
