<template>
  <v-flex class="markdown">
    <div v-html="html" ref="mdContainer" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import * as marked from 'marked'
  import router from '../router'
  import * as path from 'path'

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
      },
      preventLinkPropagation: {
        type: Boolean,
        default: false
      },
      useAbsolutePath: {
        type: Boolean,
        default: true
      },
      target: {
        type: String,
        default: null
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
        return <string>path.dirname(this.fileName)
      },
      html (): string {
        // @ts-ignore
        this.$nextTick(this.attachLinkListeners)
        const renderer = new marked.Renderer()
        renderer.link = (href, title, text) => {
          if (this.useAbsolutePath) {
            href = path.normalize(path.join(this.currentDirLoc as string, href))
          }
          const params: {[key: string]: string} = {}
          params[this.paramName as string] = href
          if (this.transformLinks) {
            const res: {href: string} = router.resolve({
              name: this.routeName,
              params
            })
            href = res.href
          }
          return `<a href="${href}"` + (title ? `title="${title}"` : '') + `>
                    ${text}
                  </a>`
        }
        return <string>marked(this.transformedMarkdown, {renderer: renderer})
      }
    },
    methods: {
      attachLinkListeners (): void {
        if (this.$refs.mdContainer instanceof Element) {
          this.$refs.mdContainer.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', (e) => {
              // @ts-ignore
              if (this.preventLinkPropagation) {
                e.preventDefault()
              }
              this.$emit('navigation', a.getAttribute('href'))
            })
          })
        }
        // @ts-ignore
        this.$nextTick(this.scrollToTarget)
      },
      scrollToTarget (): void {
        // @ts-ignore
        const target: string = this.target
        if (target && this.$refs.mdContainer instanceof HTMLElement) {
          const el = this.$refs.mdContainer.querySelector('#' + target)
          if (el) {
            setTimeout(() => {
              console.log('scrolling into view', target)
              el.scrollIntoView({
                block: 'nearest',
                inline: 'start'
              })
            }, 300)
          }
        }
      }
    }
  })
</script>

<style lang="sass">
  $listPadding: 30px
  .markdown
    ul, ol
      margin-block-start: 1em
      margin-block-end: 1em
      padding-inline-start: $listPadding
</style>
