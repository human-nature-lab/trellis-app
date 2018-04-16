<template>
  <p></p>
</template>

<script>
  export default {
    name: 'intro-question',
    props: ['question'],
    mounted: function () {
      // Intro questions are answered by default
      this.question.isAnswered = true
    }
  }
</script>

<style scoped>

</style>
