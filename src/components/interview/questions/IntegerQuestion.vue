<template>
  <v-flex class="integer-question">
    <v-text-field
      :disabled="question.dk_rf!==null"
      v-model.number="value"
      @change="onChange"
      :type="number"
      :step="1"></v-text-field>
  </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  export default {
    name: 'decimal-question',
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    mixins: [QuestionDisabledMixin],
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
