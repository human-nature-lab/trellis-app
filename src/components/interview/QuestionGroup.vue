<template>
    <div class="question-group">
      <Question v-for="question in questions"
                :question="question"></Question>
    </div>
</template>

<script>
  import Question from './Question.vue'
  export default {
    name: 'question-group',
    props: ['questions'],
    components: {
      Question
    }
  }
</script>

<style scoped>

</style>
