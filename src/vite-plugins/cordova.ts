import { ViteDevServer, Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'

function isCordova (req: IncomingMessage) {
  return !req.headers.host.startsWith('localhost')
}

export default function cordova (): Plugin {
  return {
    name: 'cordova',
    // config (config, env) {
    //   console.log('config', config, 'env', env)
    //   return config
    // },
    load (id, opts) {
      // console.log('load', id, opts)
      // return this.load(id, true)
    },
    resolveId (source, importer, options) {
      // console.log('resolveId', source, importer, options)
      // return source
    },
    configureServer (app: ViteDevServer) {
      app.middlewares.use(async (req, res, next) => {
        console.log('serving', req.url)
        next()
      })
      app.middlewares.use('/cordova.js', async (req, res, next) => {
        if (isCordova(req)) {
          const f = await fs.promises.readFile('./platforms/android/platform_www/cordova.js')
          res.writeHead(200)
          res.write(f)
          return res.end()
        }
        next()
      })
      app.middlewares.use('/cordova_plugins.js', async (req, res, next) => {
        if (isCordova(req)) {
          const f = await fs.promises.readFile('./platforms/android/platform_www/cordova_plugins.js')
          res.writeHead(200)
          res.write(f)
          return res.end()
        }
        next()
      })
      const pluginsRoot = path.join(__dirname, '../../platforms/android/platform_www/plugins')
      app.middlewares.use('/plugins', async (req, res, next) => {
        if (isCordova(req)) {
          try {
            const p = path.join(pluginsRoot, req.url)
            const f = await fs.promises.readFile(p)
            res.writeHead(200)
            res.write(f)
            return res.end()
          } catch (err) {
            console.error(err)
            next()
          }
        }
        next()
      })
    },
  }
}
