import constants from './static/constants'
/* global cordova */
export default {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.TEST,
  debug: true,
  xKey: 'rXghvr7C1Q8dRmhX2Lyl3wC62TyoAr95',
  apiRoot: 'http://10.0.1.201',
  logging: {
    console: true,    // default true
    rate: 500,        // default: 0 -> messages are written to disk immediately
    levels: [],       // default: null -> all messages are written to disk
    max: 100          // default: 0 -> infinite logs
  }
}

