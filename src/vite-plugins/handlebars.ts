/**
 * A Rollup/Vite plugin for rendering arbitrary Handlebars files into the output directory
 */
import handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import { Plugin } from 'vite'

type HandlebarsOptions = {
  entryFile?: string
  entry?: string
  filename?: string
  context?: Record<any, any>
}

export default function hb (...opts: HandlebarsOptions[]): Plugin {
  if (!opts.length) {
    throw new Error('must supply a config for handlebars')
  }
  return {
    name: 'handlebars',
    async renderStart (outputOptions) {
      for (const o of opts) {
        if (!o.filename) {
          o.filename = o.entryFile ? path.basename(o.entryFile.replace('.hbs', '')) : null
        }
        if (!o.filename) {
          throw new Error('must supply a filename or entryFile')
        }
        let input = o.entry
        if (!input) {
          input = await fs.promises.readFile(o.entryFile, 'utf8')
        }
        const renderer = handlebars.compile(input)
        await fs.promises.writeFile(path.join(outputOptions.dir, o.filename), renderer(o.context), 'utf8')
      }
    },
  }
}
