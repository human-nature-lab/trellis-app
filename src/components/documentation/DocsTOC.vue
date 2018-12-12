<template>
    <v-flex>
      <v-container>
        <v-layout class="mb-3">
          <h3>Table of contents</h3>
        </v-layout>
        <v-layout>
          <Markdown
            v-if="content"
            :transformLinks="true"
            routeName="Documentation"
            paramName="filePath"
            fileName="_Sidebar.md"
            :markdown="content" />
        </v-layout>
      </v-container>
    </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Markdown from '../Markdown'
  export default Vue.extend({
    components: {Markdown},
    async created () {
      const docs = (await import(/* webpackChunkName: "documentation" */'./docs')).default
      this.content = docs.content['./' + this.fileName]
    },
    name: 'DocsTOC',
    data () {
      return {
        fileName: '_Sidebar.md',
        content: null
      }
    }
  })
</script>

<style scoped>

</style>
