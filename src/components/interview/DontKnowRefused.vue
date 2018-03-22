<template>
  <v-layout justify-space-between>
    <v-flex>
      <v-layout row>
        <v-flex sm4 offset-xs8 row>
          <v-radio-group v-model="selected"
                         row
                         justify-right
                         @change="onChange">
            <v-radio :label="`Don't Know`"
                     :value="`DK`"></v-radio>
            <v-radio :label="`Refuse`"
                     :value="`RF`"></v-radio>
          </v-radio-group>
        </v-flex>
      </v-layout>
      <v-layout v-if="selected !== undefined" row>
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
  // TODO: This will need to be handled manually if we want to be able to deselect DK/refused type questions
  export default {
    props: ['dontKnowEnabled', 'refusedEnabled'],
    name: 'dont-know-refused',
    data: function () {
      return {
        selected: undefined,
        reason: ''
      }
    },
    methods: {
      // This is where we handle deselecting an already selected option
      onChange: function (event) {
        console.log(event)
      },
      onClick: function (event) {
        console.log(event.target)
      }
    }
  }
</script>

<style scoped>

</style>
