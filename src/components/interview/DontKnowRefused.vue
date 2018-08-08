<template>
  <v-flex>
    <v-layout row>
      <v-btn
        v-bind:class="{'primary': dk}"
        @click="dk=!dk">
        {{ $t('do_not_know') }}
      </v-btn>
      <v-btn
        v-bind:class="{'primary': rf}"
        @click="rf=!rf">
        {{ $t('refuse_to_answer') }}
      </v-btn>
    </v-layout>
    <v-layout v-if="shouldShowReason">
      <v-text-field
        name="Reason"
        :label="$t('reason')"
        :rules="rules"
        v-model="reason"
        required
        autofocus />
    </v-layout>
  </v-flex>
</template>

<script>
  import ActionMixin from './mixins/ActionMixin'
  import AT from '../../static/action.types'
  export default {
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [ActionMixin],
    name: 'dont-know-refused',
    data: function () {
      return {
        _reason: this.question.datum.dk_rf_val,
        rules: [value => !!value || this.$t('required_field')]
      }
    },
    created: function () {
      this._reason = this.question.datum.dk_rf_val // We're actually binding to a text model so here we need to initialize that var
    },
    computed: {
      shouldShowReason: function () {
        return this.question.datum.dkRf != null
      },
      reason: {
        get: function () {
          return this.question.datum.dkRfVal
        },
        set: function (val) {
          this._reason = val
          this.action(AT.dk_rf_val, {
            dk_rf_val: val
          })
        }
      },
      dk: {
        get: function () {
          if (this.question.datum.dkRf === null) {
            return false
          } else {
            return this.question.datum.dkRf
          }
        },
        set: function (val) {
          this.action(AT.dk_rf, {
            dk_rf: val ? true : this.rf ? false : null
          })
        }
      },
      rf: {
        get: function () {
          if (this.question.datum.dkRf === null) {
            return false
          } else {
            return !this.question.datum.dkRf
          }
        },
        set: function (val) {
          this.action(AT.dk_rf, {
            dk_rf: val === false ? null : false
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
