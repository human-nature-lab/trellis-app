import constants from './static/constants'

const config = {
  appEnv: constants.APP_ENV.CORDOVA,
  appMode: constants.APP_MODE.PROD,
  xKey: 'rXghvr7C1Q8dRmhX2Lyl3wC62TyoAr95',
  apiRoot: 'https://api.trellisprod.net',
  database: {
    logging: ['warning', 'error']
  },
  logging: {
    levels: ['warn', 'error']
  },
  sentry: {
    dsn: 'https://9a69dfd63e02433386c0f98af65354d0@sentry.io/1382345',
    onlineIntervalRate: 2 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}

export default config
