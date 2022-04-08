<template>
  <v-flex class="documentation">
    <v-container>
      <v-layout v-if="isLoaded">
        <Markdown
          :transformLinks="transformLinks"
          :preventLinkPropagation="preventLinkPropagation"
          @navigation="$emit('navigation', $event)"
          routeName="Documentation"
          paramName="filePath"
          :fileName="currentFile"
          :markdown="markdown"
          :target="target"/>
      </v-layout>
      <v-layout v-else>{{$t('loading')}}</v-layout>
    </v-container>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Markdown from '../Markdown.vue'
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
      parts (): string[] {
        return this.currentFile.split('#')
      },
      target (): string|null {
        return this.parts.length > 1 ? this.parts[1] : null
      },
      fileKey (): string {
        const fileName = this.parts[0]
        return fileName.slice(-3) === '.md' ? fileName : fileName + '.md'
      },
      markdown (): string {
        console.log('Current documentation file', this.currentFile, this.content)
        console.log('key', this.fileKey, 'target', this.target)
        if (this.isReady && this.content[this.fileKey]) {
          return this.content[this.fileKey]
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

<style lang="sass">
  .documentation
    &.container, &.layout
      width: 100%
      overflow: hidden
</style>
