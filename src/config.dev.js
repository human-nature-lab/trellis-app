import constants from './static/constants'

const config = {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.PROD,
  debug: true,
  xKey: '***REMOVED***',
  // apiRoot: 'http://api.trellisandroid.net',
  // apiRoot: 'http://10.0.1.222',
  apiRoot: 'http://10.0.1.6:8888',
  // apiRoot: 'http://10.0.0.193:8888',
  // apiRoot: 'http://192.168.10.10',
  // apiRoot: 'https://api.***REMOVED***',
  user: {
    username: 'admin',
    password: '***REMOVED***'
  },
  // user: {
  //   username: 'admin',
  //   password: '***REMOVED***'
  // },
  logging: {
    levels: ['info', 'debug']
  },
  database: {
    logging: true
  }
}

console.log('ENV: ', config.appEnv)

export default config
