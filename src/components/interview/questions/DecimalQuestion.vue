<template>
    <v-flex>
      <v-text-field
        :disabled="isQuestionDisabled"
        v-model.number="value"
        @change="onChange"
        placeholder="decimal"
        :mask="'##########.#####'"
        type="number"></v-text-field>
    </v-flex>
</template>

<script>
  // TODO: It might be required to use https://github.com/text-mask/text-mask/tree/master/core to support decimal type
  // inputs
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
        console.log('Decimal value', value)
      }
    }
  }
</script>

<style scoped>

</style>
