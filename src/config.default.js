import constants from './static/constants'
/* global cordova */
export default {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.TEST,
  debug: true,
  xKey: '***REMOVED***',
  apiRoot: 'http://10.0.1.201'
}

