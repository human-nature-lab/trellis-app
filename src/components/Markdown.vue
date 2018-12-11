<template>
  <v-flex class="markdown">
    <div v-html="html" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import * as marked from 'marked'
  import router from '../router'
  import {Route} from "vue-router/types/router"
  export default Vue.extend({
    name: 'Markdown',
    props: {
      transformLinks: {
        type: Boolean,
        default: false
      },
      routeName: {
        type: String,
        default: ''
      },
      paramName: {
        type: String,
        default: 'filePath'
      },
      fileNames: {
        type: Array,
        required: false
      },
      fileName: {
        type: String,
        required: true
      },
      markdown: {
        type: String,
        required: true
      }
    },
    computed: {
      html (): string {
        if (this.transformLinks) {
          const renderer = new marked.Renderer()
          renderer.link = (href, title, text) => {
            const params: {[key: string]: string} = {}
            params[this.paramName as string] = href
            const res: {href: string} = router.resolve({
              name: this.routeName,
              params
            })
            return `<a href="${res.href}" title="${title}">
                    ${text}
                  </a>`
          }
          return marked(this.markdown, {renderer: renderer}) as string
        } else {
          return marked(this.markdown) as string
        }
      }
    }
  })
</script>

<style lang="sass">
  $listPadding: 30px
  .markdown
    ul
      margin-block-start: 1em
      margin-block-end: 1em
      padding-inline-start: $listPadding
</style>
