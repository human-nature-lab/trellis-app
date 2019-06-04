<template>
  <v-flex>
    <Documentation
      v-if="currentFile"
      :transformLinks="true"
      :currentFile="currentFile" />
    <v-navigation-drawer right app v-model="isTOCOpen">
      <DocsTOC
        @close="isTOCOpen = false"
        :transformLinks="true" />
    </v-navigation-drawer>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Documentation from './Documentation'
  import DocsTOC from './DocsTOC'
  import {Route} from "vue-router/types/router"
  import global from '../../static/singleton'
  export default Vue.extend({
    components: {Documentation, DocsTOC},
    name: 'DocsRoute',
    beforeRouteEnter (to: Route, from: Route, next) {
      global.secondaryDrawer.isEnabled = true
      global.secondaryDrawer.icon = 'toc'
      next()
    },
    beforeRouteUpdate (to: Route, from: Route, next) {
      if (to.params.filePath && to.params.filePath !== from.params.filePath) {
        this.currentFile = './' + to.params.filePath
      }
      next()
    },
    beforeRouteLeave (to: Route, from: Route, next) {
      global.secondaryDrawer.isEnabled = false
      next()
    },
    async created () {
      global.secondaryDrawer.onClick = this.toggleTOC
      const docs = (await import('./docs')).default
      this.names = docs.names
      this.currentFile = this.$route.params.filePath ? './' + this.$route.params.filePath : docs.names[0]
    },
    data () {
      return {
        names: [],
        currentFile: null,
        isTOCOpen: false
      }
    },
    methods: {
      toggleTOC () {
        this.isTOCOpen = !this.isTOCOpen
      }
    }
  })
</script>

<style scoped>

</style>
