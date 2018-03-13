<template>
  <div class="multiple-choice">
    <v-checkbox v-for="choice in question.choices"
                :key="choice.id"
                :label="choice.text"
                :value="choice.val"
                v-model="selected"></v-checkbox>
  </div>
</template>

<script>
  export default {
    props: ['question'],
    name: 'multiple-select-question',
    data: function () {
      return {
        selected: []
      }
    }
  }
</script>

<style scoped>

</style>
