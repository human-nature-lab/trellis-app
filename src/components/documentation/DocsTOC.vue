<template>
    <v-flex>
      <v-toolbar flat>
        <v-toolbar-title>
          Table of contents
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container>
        <v-layout>
          <Markdown
            v-if="content"
            @navigation="$emit('navigation', $event)"
            :preventLinkPropagation="preventLinkPropagation"
            :transformLinks="transformLinks"
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
  import Markdown from '../Markdown.vue'
  import { DocsEventTypes } from './DocsEventBus'
  export default Vue.extend({
    components: {Markdown},
    async created () {
      const docs = (await import(/* webpackChunkName: "documentation" */'./docs')).default
      this.content = docs.content['./' + this.fileName]
    },
    data () {
      return {
        fileName: '_Sidebar.md',
        content: null
      }
    },
    name: 'DocsTOC',
    props: {
      transformLinks: {
        type: Boolean,
        default: false
      },
      preventLinkPropagation: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      close () {
        this.$emit(DocsEventTypes.close)
      }
    }
  })
</script>
