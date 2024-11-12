<template>
  <v-col no-gutter>
    <v-row no-gutter>
      <v-spacer />
      <v-btn
        v-if="showDk"
        small
        depressed
        :class="{primary: dk}"
        class="ml-2"
        :disabled="disabled"
        @click="dk =! dk">
        {{ $t('do_not_know') }}
      </v-btn>
      <v-btn
        v-if="showRf"
        small
        depressed
        class="ml-2"
        :class="{primary: rf}"
        :disabled="disabled"
        @click="rf =! rf">
        {{ $t('refuse_to_answer') }}
      </v-btn>
    </v-row>
    <v-col v-if="shouldShowReason">
      <v-text-field
        name="Reason"
        :disabled="disabled"
        :label="$t('reason')"
        :rules="rules"
        v-model="reason"
        required
        :autofocus="!reason || !reason.length" />
    </v-col>
  </v-col>
</template>

<script>
  import ActionMixin from './mixins/ActionMixin'
  import AT from '../../static/action.types'
  import PT from '../../static/parameter.types'
  export default {
    props: {
      question: {
        type: Object,
        required: true
      },
      disabled: {
        type: Boolean,
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
      // We're actually binding to a text model so here we need to initialize that var
      this._reason = this.question.datum.dk_rf_val
    },
    computed: {
      showDk () {
        for (const qp of this.question.questionParameters) {
          if (parseInt(qp.parameterId, 10) === PT.show_dk) {
            return !!+qp.val
          }
        }
        return true
      },
      showRf () {
        for (const qp of this.question.questionParameters) {
          if (parseInt(qp.parameterId, 10) === PT.show_rf) {
            return !!+qp.val
          }
        }
        return true
      },
      shouldShowReason: function () {
        return this.question.datum.dkRf != null
      },
      reason: {
        get: function () {
          return this.question.datum.dkRfVal
        },
        set: function (val) {
          this._reason = val
          this.debouncedAction(AT.dk_rf_val, {
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
        color: white
</style>
