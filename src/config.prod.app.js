import constants from './static/constants'

const config = {
  appEnv: constants.APP_ENV.CORDOVA,
  appMode: constants.APP_MODE.PROD,
  xKey: '***REMOVED***',
  apiRoot: 'https://api.***REMOVED***',
  database: {
    logging: ['warning', 'error']
  },
  logging: {
    levels: ['warn', 'error']
  },
  sentry: {
    dsn: '***REMOVED***',
    onlineIntervalRate: 2 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}

export default config
