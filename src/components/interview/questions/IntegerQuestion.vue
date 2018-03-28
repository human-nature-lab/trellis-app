<template>
  <v-flex class="integer-question">
    <div class="question-text">
      <h3></h3>
    </div>
    <v-text-field
      v-model.number="value"
      @change="onChange"
      :type="number"
      :step="1"></v-text-field>
  </v-flex>
</template>

<script>
  export default {
    name: 'decimal-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        value: null
      }
    },
    methods: {
      onChange: function (value) {
        // TODO: send update to the action handler
        console.log('Integer value', value)
      }
    }
  }
</script>

<style scoped>

</style>
