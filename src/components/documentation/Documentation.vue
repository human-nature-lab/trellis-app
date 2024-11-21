<template>
  <v-flex class="documentation">
    <v-container v-if="isLoaded">
      <div
        :is="markdown"
        v-on="$listeners"
      />
    </v-container>
    <v-container v-else>
      {{ $t('loading') }}
    </v-container>
  </v-flex>
</template>

<script lang="ts">
import Vue, { Component } from 'vue'

export default Vue.extend({
  name: 'Documentation',
  props: {
    currentFile: {
      type: String,
      required: true,
    },
    transformLinks: {
      type: Boolean,
      default: false,
    },
    preventLinkPropagation: {
      type: Boolean,
      default: false,
    },
  },
  async created () {
    this.isLoaded = false
    const docs = (await import('./docs')).default
    console.log('docs', docs)
    this.content = docs.content
    this.isLoaded = true
  },
  data () {
    return {
      isLoaded: false,
      content: {},
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
      let fileName = this.parts[0]
      if (fileName.startsWith('/')) {
        fileName = fileName.slice(1)
      }
      return fileName.slice(-3) === '.md' ? fileName : fileName + '.md'
    },
    markdown (): Component {
      console.log('markdown')
      console.log('Current documentation file', this.currentFile, this.content)
      console.log('key', this.fileKey, 'target', this.target)
      if (this.isReady && this.content[this.fileKey]) {
        return this.content[this.fileKey]
      } else {
        return undefined
      }
    },
    isReady (): boolean {
      return this.isLoaded && !!this.currentFile && !!this.content
    },
  },
})
</script>

<style lang="sass">
  .documentation
    &.container, &.layout
      width: 100%
      overflow: hidden
</style>
