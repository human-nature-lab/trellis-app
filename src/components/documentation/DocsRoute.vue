<template>
  <v-flex>
    <v-container>
      <router-view /> 
    </v-container>
    <!-- <Documentation
      v-if="currentFile"
      :transform-links="true"
      :current-file="currentFile"
    /> -->
    <v-navigation-drawer
      right
      app
      v-model="isTOCOpen"
    >
      <DocsTOC
        @close="isTOCOpen = false"
        :transform-links="true"
      />
    </v-navigation-drawer>
  </v-flex>
</template>

<script lang="ts">
import Vue from 'vue'
import DocsTOC from './DocsTOC.vue'
import { Route } from 'vue-router'
import global from '../../static/singleton'

export default Vue.extend({
  components: { DocsTOC },
  name: 'DocsRoute',
  beforeRouteEnter (to: Route, from: Route, next) {
    global.secondaryDrawer.isEnabled = true
    global.secondaryDrawer.icon = 'mdi-table-of-contents'
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
    this.currentFile = this.$route.params.filePath ? './' + this.$route.params.filePath : './Home.md'
  },
  data () {
    return {
      names: [],
      currentFile: null,
      isTOCOpen: false,
    }
  },
  methods: {
    toggleTOC () {
      this.isTOCOpen = !this.isTOCOpen
    },
  },
})
</script>
