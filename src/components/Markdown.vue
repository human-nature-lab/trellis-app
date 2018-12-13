<template>
  <v-flex class="markdown">
    <div v-html="html" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import * as marked from 'marked'
  import router from '../router'
  import * as path from 'path'
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
      /**
       * Transforms the markdown supplied into valid markdown. Changes gollum/github flavored links into valid markdown
       * links. Thanks to https://github.com/markedjs/marked/issues/471#issuecomment-273718851
       * @returns {string}
       */
      transformedMarkdown (): string {
        return (this.markdown as string).replace(/\[\[([^\]]+)\]\]/g, function(allPattern, link) {

          // inside of brekets link can be added as:
          // - page name only [[Calls]], [[Call-Log]];
          // - link title only [[Call Log]];
          // - link title and page name [[Call Log|Call-Log]], [[Log|Call Log]].

          // search for link title
          let linkTitle = link.replace(/\|([^\|]+)/, '')

          // search for page name
          let pageName = link.replace(/([^\|]+)\|/, '')

          if(!linkTitle){
            linkTitle = link
          }

          if (!pageName){
            pageName = link
          }

          // make sure page name has correct format
          link = pageName.replace(' ', '-')

          // convert [[<link title> | <page name>]] to [<link title>](<page name>)
          link = `[${linkTitle}](${pageName})`
          return link
        })
      },
      currentDirLoc (): string {
        // @ts-ignore
        return path.dirname(this.fileName)
      },
      html (): string {
        if (this.transformLinks) {
          // We replace links with relative versions to ensure they always match relative to the current location
          const renderer = new marked.Renderer()
          renderer.link = (href, title, text) => {
            const params: {[key: string]: string} = {}
            params[this.paramName as string] = path.normalize(path.join(this.currentDirLoc as string, href))
            const res: {href: string} = router.resolve({
              name: this.routeName,
              params
            })
            return `<a href="${res.href}"` + (title ? `title="${title}"` : '') + `>
                    ${text}
                  </a>`
          }
          return marked(this.transformedMarkdown, {renderer: renderer}) as string
        } else {
          return marked(this.transformedMarkdown) as string
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
