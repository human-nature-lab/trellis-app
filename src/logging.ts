import * as Sentry from '@sentry/browser'
import Locale from './entities/trellis/Locale'
import Vue from 'vue'
import config from './config'
import Study from './entities/trellis/Study'
import DeviceService from './services/device'
import SentryOfflineTransport from './services/logging/SentryOfflineTransport'
import { BrowserOptions } from '@sentry/browser/esm'
import { APP_ENV } from './static/constants'
import SingletonService from './services/SingletonService'
import DatabaseService from './services/database'
declare const VERSION: string

async function asyncSetup () {
  let server = config.apiRoot
  let deviceId = null
  let snapshotId = null
  if (config.appEnv === APP_ENV.CORDOVA) {
    server = await DatabaseService.getServerIPAddress()
    deviceId = await DeviceService.getUUID()
    snapshotId = (await DatabaseService.getLatestDownload()).snapshotId
  }
  Sentry.configureScope(scope => {
    scope.setTag('server', server)
    scope.setTag('device', deviceId)
    scope.setTag('snapshot', snapshotId)
  })
}

if (config.sentry && config.sentry.dsn) {
  let release = 'trellis-' + VERSION
  // if (!config.debug) {
  //   release += (config.appEnv === APP_ENV.CORDOVA ? '-cordova' : '-web')
  // }
  const sentryConfig: BrowserOptions = {
    dsn: config.sentry.dsn,
    release: release,
    environment: config.debug ? 'dev' : 'prod',
    integrations: [new Sentry.Integrations.Vue({ Vue }), new Sentry.Integrations.RewriteFrames()],
    debug: config.debug
  }
  if (config.sentry.offline) {
    console.info('SentryOfflineTransport implemented')
    sentryConfig.transportOptions = {
      dsn: config.sentry.dsn
    }
    if (config.sentry.onlineIntervalRate) {
      sentryConfig.transportOptions.onlineIntervalRate = config.sentry.onlineIntervalRate
    }
    sentryConfig.transport = SentryOfflineTransport
  }
  console.info('Using sentry for logging', sentryConfig)
  Sentry.init(sentryConfig)

  Sentry.configureScope(scope => {
    scope.setTag('platform', config.appEnv === APP_ENV.CORDOVA ? 'cordova' : 'web')
  })

  // Subscribe to changes to the user and locale via the SingletonService
  SingletonService.on('user', user => {
    Sentry.configureScope(scope => {
      if (user && user.id) {
        scope.setUser({
          id: user.id,
          username: user.username
        })
      } else {
        scope.setUser(null)
      }
    })
  })
  SingletonService.on('locale', (locale: Locale) => {
    if (locale) {
      Sentry.configureScope(scope => {
        scope.setTag('locale', locale.languageName)
      })
    }
  })
  SingletonService.on('study', (study: Study) => {
    if (study) {
      Sentry.configureScope(scope => {
        scope.setTag('study', study.id)
      })
    }
  })

  asyncSetup()

} else {
  console.info('Not using sentry for logging')
}



