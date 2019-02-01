import * as Sentry from '@sentry/browser'
import Vue from 'vue'
import config from './config'
import SentryOfflineTransport from "./services/logging/SentryOfflineTransport";
import {BrowserOptions} from "@sentry/browser/esm";
declare const VERSION: string

if (config.sentry && config.sentry.dsn) {
  const sentryConfig: BrowserOptions = {
    dsn: config.sentry.dsn,
    release: VERSION,
    environment: config.debug ? 'dev' : 'prod',
    integrations: [new Sentry.Integrations.Vue({ Vue })],
    debug: config.debug
  }
  console.info('Using sentry for logging')
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
  Sentry.init(sentryConfig)
} else {
  console.info('Not using sentry for logging')
}



