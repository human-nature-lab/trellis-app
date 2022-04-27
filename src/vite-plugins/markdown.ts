/**
 * A Rollup/Vite plugin to pre-render markdown files when they are imported
 */
import { merge } from 'lodash'
import { marked } from 'marked'
import fs from 'fs'
import path from 'path'
import { replaceAll } from '../classes/replaceAll'
import hljs from 'highlight.js'

type MarkdownOpts = {
  include?: RegExp[]
  rootPath?: string
  type?: 'html' | 'vue'
  marked?: marked.MarkedOptions
}

export default function markdown (opts?: MarkdownOpts) {
  opts = merge({
    rootPath: path.join(__dirname, '../../docs'),
    type: 'vue',
    marked: {
      baseUrl: '/#/documentation/',
    },
  } as MarkdownOpts, opts)
  if (opts.include && !opts.include.length) {
    throw new Error('must include at least one include statement or omit the include option')
  }

  if (opts.marked) {
    marked.setOptions(opts.marked)
  }

  let currentFile: string
  const toImport = new Set<string>()
  const renderer = {
    link (href: string, title: string, text: string) {
      if (!href.startsWith('http')) {
        const currentDir = path.dirname(currentFile)
        const relDir = path.relative(opts.rootPath, path.resolve(opts.rootPath, currentDir))
        const p = path.relative('/', path.resolve(relDir, href))
        // console.log('link', currentFile, relDir, href, p)
        let nhref = opts.marked.baseUrl + path.join(relDir, href)
        nhref = replaceAll(nhref, '\\', '/')
        if (href === 'Home.md') {
          nhref = opts.marked.baseUrl + ''
        }
        return `<a href="${nhref}" title="${title}">${text}</a>`
      } else {
        return `<a href="${href}" title="${title}" target="_blank">${text}</a>`
      }
    },
    table (header: string, body: string) {
      return `<table class="table">${header}${body}</table>`
    },
    code (src: string) {
      const highlighted = hljs.highlightAuto(src)
      toImport.add('highlight.js/styles/dark.css')
      return `<pre class="hljs w-full"><code class="hljs">${highlighted.value}</code></pre>`
    },
  }
  marked.use({ renderer })
  return {
    name: 'markdown',
    async load (id: string) {
      let isMarkdown = false
      if (opts.include) {
        // TODO
      } else {
        isMarkdown = id.endsWith('.md')
      }
      if (isMarkdown) {
        const data = await fs.promises.readFile(id, 'utf8')
        currentFile = id
        toImport.clear()
        let html = marked.parse(data)
        if (opts.type === 'vue') {
          html = replaceAll(html, '`', "'")
          const imports = Array.from(toImport).map(v => `import '${v}'`).join('\n')
          return '<template>\n<div v-html="html" />\n</template>\n<script>\n' +
          imports +
          '\nexport default { data () { return { html: `' + html + '` } } }\n</script>'
        }
        return `<div>${html}</div>`
      }
      // if (id === 'virtual-module') {
      //   return 'export default "This is virtual!"' // the source code for "virtual-module"
      // }
      return null // other ids should be handled as usually
    },
  }
}
