const constants = require('./static/constants')

module.exports = {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.PROD,
  debug: true,
  xKey: '***REMOVED***',
  apiRoot: 'http://api.trellisandroid.net',
  formBuilderUrl: 'http://trellisandroid.net/#/form/{form_id}/builder?token={token}&study={study}&locale={locale}',
  // apiRoot: 'http://10.0.1.222',
  // apiRoot: 'http://10.0.1.6:8888',
  // apiRoot: 'http://10.0.0.193:8888',
  // apiRoot: 'http://192.168.10.10',
  // apiRoot: 'https://api.***REMOVED***',
  mapTileLayer: {
    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.emerald',
    accessToken: '***REMOVED***',
    style: 'mapbox://styles/mapbox/streets-v10'
  },
  user: {
    username: 'admin',
    password: '***REMOVED***'
  },
  logging: {
    levels: ['info', 'debug']
  },
  // database: {
  //   //   logging: true
  //   // },
  sentry: {
    dsn: '***REMOVED***',
    onlineIntervalRate: 1 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}

console.log('ENV: ', module.exports.appEnv)
