<template>
<v-radio-group v-model="selected">
  <v-radio v-for="choice in question.choices"
           :key="choice.id"
           :label="choice.text"
           :value="choice.id"
  ></v-radio>
</v-radio-group>
</template>

<script>
  export default {
    props: ['question'],
    name: 'multiple-choice-question',
    data: function () {
      return {
        selected: null
      }
    }
  }
</script>

<style scoped>

</style>
