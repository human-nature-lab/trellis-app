import constants from './static/constants'

const config = {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.PROD,
  debug: true,
  xKey: '***REMOVED***',
  // apiRoot: 'http://10.0.1.6:8888',
  apiRoot: 'http://api.trellisandroid.net',
  // apiRoot: 'http://192.168.10.10',
  // user: {
  //   username: 'admin',
  //   password: '***REMOVED***'
  // },
  database: {
    logging: true
  }
}

export default config
