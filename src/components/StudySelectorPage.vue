<template>
  <v-card>
    <h2>Choose a study</h2>
    <StudySelector />
    <v-btn @click="done">Done</v-btn>
  </v-card>
</template>

<script>
  import router from '../router/router'
  import StudySelector from './StudySelector'
  export default {
    name: 'study-selector-page',
    methods: {
      done: function () {
        if (this.$route.query.to) {
          router.push({path: this.$route.query.to})
        } else {
          router.push({name: 'home'})
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
