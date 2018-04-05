<template>
  <v-layout justify-space-between>
    <v-flex>
      <v-layout row>
        <v-flex sm4 offset-xs8 row>
            <v-checkbox
              :label="`Don't Know`"
              v-model="dk" />
            <v-checkbox
              :label="`Refuse`"
              v-model="rf" />
        </v-flex>
      </v-layout>
      <v-layout v-if="shouldShowReason" row>
        <v-text-field
          name="Reason"
          label="Reason"
          v-model="reason"
        ></v-text-field>
      </v-layout>
    </v-flex>
  </v-layout>

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
        reason: ''
      }
    },
    methods: {
      // This is where we handle deselecting an already selected option
      // onChangeDK: function (dk) {
      //   console.log('dk', dk)
      //   this.$emit('action', )
      // },
      // onChangeRF: function (rf) {
      //   console.log('rf', rf)
      // }
    },
    computed: {
      shouldShowReason: function () {
        return this.question.datum.dk_rf !== null && this.question.datum.dk_rf !== undefined
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
          actionBus.$emit('action', {
            action_type: 'dk-rf',
            question_datum_id: this.question.datum.id,
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
            question_datum_id: this.question.datum.id,
            payload: {
              dk_rf: val === false ? null : false
            }
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
