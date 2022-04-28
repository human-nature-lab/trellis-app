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

const schema = {
  type: 'object',
  properties: {
    marked: {
      type: 'object',
    },
  },
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
    link (href, title, text) {
      const isExternal = href.startsWith('http')
      if (!isExternal) {
        const currentDir = path.dirname(currentFile)
        const relDir = path.relative(opts.rootPath, path.resolve(opts.rootPath, currentDir))
        let nhref = opts.marked.baseUrl + path.join(relDir, href)
        nhref = nhref.replaceAll('\\', '/')
        if (href === 'Home.md') {
          nhref = opts.marked.baseUrl + ''
        }
        return `<a href="${nhref}" title="${title}">${text}</a>`
      } else {
        return `<a href="${href}" title="${title}" target="_blank">${text}</a>`
      }
    },
    table (header, body) {
      return `<table class="table">${header}${body}</table>`
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
  const name = path.basename(currentFile).replace('.md', '')
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
      render: ${r.render},
    }`
  }
  let res = `<template><div>${html}</div></template>\n`
  if (imports !== '') {
    res += `<script>\n${imports}\n export default { name : '${name}' }</script>\n`
  }
  res += '<style></style>'
  return res
}

module.exports = function (source) {
  const options = getOptions(this)
  const done = this.async()
  // Apply some transformations to the source...
  transform.call(this, options, source)
    .then(res => {
      // console.log(res)
      done(null, res)
    })
    .catch(err => done(err))
}
