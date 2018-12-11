<template>
    <Documentation
      v-if="currentFile"
      :currentFile="currentFile" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import Documentation from './Documentation'
  import {Route} from "vue-router/types/router"
  export default Vue.extend({
    components: {Documentation},
    name: 'DocsRoute',
    beforeRouteUpdate (to: Route, from: Route, next) {
      if (to.params.filePath && to.params.filePath !== from.params.filePath) {
        this.currentFile = './' + to.params.filePath
      }
      next()
    },
    async created () {
      const docs = (await import('./docs')).default
      this.names = docs.names
      this.currentFile = this.$route.params.filePath ? './' + this.$route.params.filePath : docs.names[0]
    },
    data () {
      return {
        names: [],
        currentFile: null
      }
    }
  })
</script>

<style scoped>

</style>
