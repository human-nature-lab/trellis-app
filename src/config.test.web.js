const constants = require('./static/constants')

module.exports = {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.PROD,
  debug: true,
  xKey: 'rXghvr7C1Q8dRmhX2Lyl3wC62TyoAr95',
  apiRoot: 'http://api.trellisandroid.net',
  formBuilderUrl: 'http://trellisandroid.net/#/form/{form_id}/builder?token={token}&study={study}&locale={locale}',
  // apiRoot: 'http://10.0.1.222',
  // apiRoot: 'http://10.0.1.6:8888',
  // apiRoot: 'http://10.0.0.193:8888',
  // apiRoot: 'http://192.168.10.10',
  // apiRoot: 'https://api.trellistest.net',
  mapTileLayer: {
    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.emerald',
    accessToken: 'pk.eyJ1IjoiZGlzcGVyc2UiLCJhIjoiSUtqRFhKZyJ9.eixdwJkaNkCiPPWew9i4pQ',
    style: 'mapbox://styles/mapbox/streets-v10'
  },
  user: {
    username: 'admin',
    password: 'Trellis@1820'
  },
  logging: {
    levels: ['info', 'debug']
  },
  // database: {
  //   //   logging: true
  //   // },
  sentry: {
    dsn: 'https://9a69dfd63e02433386c0f98af65354d0@sentry.io/1382345',
    onlineIntervalRate: 1 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}

console.log('ENV: ', module.exports.appEnv)
