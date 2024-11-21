/**
 * Converts markdown files into Vue components using markedjs
 */
const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const { marked } = require('marked')
const { merge } = require('lodash')
const path = require('path')
const hljs = require('highlight.js')
const compiler = require('vue-template-compiler')
const fs = require('fs')

const schema = {
  type: 'object',
  properties: {
    marked: {
      type: 'object',
    },
  },
}

function log (...args) {
  // console.log(...args)
  fs.appendFileSync('log.txt', `${new Date().toISOString()} ${args.join(' ')}\n`)
}

let configuredMarked = false
let currentFile
const toImport = new Set()

function configure (opts) {
  if (opts) {
    validateOptions(schema, opts, 'Markdown Vue Loader')
  }
  opts = merge({}, opts)
  if (opts.marked) {
    marked.setOptions(opts.marked)
  }

  const renderer = {
    heading (text, level) {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
      const padding = 14 - 2 * level
      return `
              <h${level} class="pt-${padding}" id="${escapedText}">
                ${text}
              </h${level}>`
    },
    link (href, title, text) {
      const isExternal = href.startsWith('http')
      if (!isExternal) {
        log('currentFile', currentFile, 'href', href)
        const currentDir = path.dirname(currentFile)
        log('currentDir', currentDir)
        const relDir = path.relative(opts.rootPath, path.resolve(opts.rootPath, currentDir))
        log('relDir', relDir)
        let nhref = opts.marked.baseUrl + path.join(relDir, href)
        nhref = nhref.replaceAll('\\', '/')
        if (href === 'Home.md') {
          nhref = opts.marked.baseUrl + ''
        }
        log('nhref', nhref)
        return `<a href="${nhref}" title="${title}" @click.prevent="onClickLink('${nhref}', false)">${text}</a>`
      } else {
        return `<a href="${href}" title="${title}" target="_blank" @click.prevent="onClickLink('${href}', true)">${text}</a>`
      }
    },
    table (header, body) {
      return `<div class="v-data-table">
        <div class="v-data-table__wrapper">
          <table class="table">
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </div>`
    },
    tablecell (content, flags) {
      // flags: { header: boolean, align: 'left' | 'right' }
      if (flags.header) {
        return `<th class="text-left">${content}</th>`
      } else {
        return `<td>${content}</td>`
      }
    },
    code (src) {
      const highlighted = hljs.highlightAuto(src)
      toImport.add('highlight.js/styles/dark.css')
      return `<pre class="hljs w-full"><code class="hljs">${highlighted.value}</code></pre>`
    },
  }
  marked.use({ renderer })
}

async function transform (opts, source) {
  if (!configuredMarked) {
    configuredMarked = true
    await configure(opts)
  }
  toImport.clear()
  const parts = this.request.split('!')
  currentFile = parts[parts.length - 1].split('?')[0]
  let html = marked.parse(source)
  html = html.replaceAll('`', '\'')
  const imports = Array.from(toImport).map(v => `import '${v}'`).join('\n')
  let name = path.basename(currentFile).replace('.md', '')
  name = name.trim('_')
  if (opts.compileVue) {
    const r = compiler.compile('<div v-html="html" />')
    if (r.errors && r.errors.length) {
      throw r.errors
    }
    return `${imports}\n 
    export default { 
      data: function () {
        return {
          html: ` + '`' + html + '`' + `
        }
      },
      methods: {
        onClickLink (href, isExternal) {
          this.$emit('click-link', href, isExternal)
        },
      },
      render: ${r.render},
    }`
  }
  let res = `<template><div>${html}</div></template>\n`
  res += `<script>\n${imports}\n export default { 
    name : '${name}',
    methods: {
      onClickLink (href, isExternal) {
        this.$emit('click-link', href, isExternal)
      },
    },
  }</script>\n`
  res += '<style></style>'
  return res
}

module.exports = function (source) {
  const options = getOptions(this)
  const done = this.async()
  // Apply some transformations to the source...
  transform.call(this, options, source)
    .then(res => {
      log(res.toString())
      done(null, res)
    })
    .catch(err => done(err))
}
