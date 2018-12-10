<template>
  <v-container>
    <v-layout>
      <v-flex v-html="text"></v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import * as marked from 'marked'
  export default {
    name: 'MarkdownDirectoryReader',
    props: {
      directoryPath: {
        type: String,
        required: true
      },
      entryFileName: {
        type: String,
        default: 'index.md'
      },
      fileQueryId: {
        type: String,
        default: 'openFile'
      }
    },
    data () {
      return {
        text: this.$t('loading')
      }
    },
    async created () {
      await this.loadDirectory()
      this.onPathChanged()
    },
    methods: {
      loadDirectory () {

      },
      onPathChanged () {

      },
      readFile (filePath) {

      }
    }
  }
</script>

<style scoped>

</style>
