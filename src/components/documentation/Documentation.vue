<template>
  <v-flex>
    <v-container>
      <v-layout v-if="isLoaded">
        <Markdown
          :transformLinks="transformLinks"
          :preventLinkPropagation="preventLinkPropagation"
          @navigation="$emit('navigation', $event)"
          routeName="Documentation"
          paramName="filePath"
          :fileName="currentFile"
          :markdown="markdown" />
      </v-layout>
      <v-layout v-else>{{$t('loading')}}</v-layout>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Markdown from '../Markdown'
  export default Vue.extend({
    components: {Markdown},
    name: 'Documentation',
    props: {
      currentFile: {
        type: String,
        required: true
      },
      transformLinks: {
        type: Boolean,
        default: false
      },
      preventLinkPropagation: {
        type: Boolean,
        default: false
      }
    },
    async created () {
      this.isLoaded = false
      const docs = (await import(/* webpackChunkName: "documentation" */'./docs')).default
      this.content = docs.content
      this.isLoaded = true
    },
    data () {
      return {
        isLoaded: false,
        content: {}
      }
    },
    computed: {
      markdown (): string {
        console.log('Current documentation file', this.currentFile, this.content)
        if (this.isReady && this.content[this.currentFile]) {
          return this.content[this.currentFile]
        } else {
          return 'Unknown file'
        }
      },
      isReady (): boolean {
        return this.isLoaded && !!this.currentFile && !!this.content
      }
    }
  })
</script>

<style scoped>

</style>
