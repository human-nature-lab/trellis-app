<template>
  <v-card>
    <h2>Choose a study</h2>
    <StudySelector />
    <v-btn @click="done">Done</v-btn>
  </v-card>
</template>

<script>
  import index from '../router/index'
  import StudySelector from './StudySelector'
  export default {
    name: 'study-selector-page',
    methods: {
      done: function () {
        if (this.$route.query.to) {
          index.push({path: this.$route.query.to})
        } else {
          index.push({name: 'home'})
        }
      }
    },
    head: {
      title: {
        inner: 'Study Selector'
      }
    },
    components: {
      StudySelector
    }
  }
</script>

<style scoped>

</style>
