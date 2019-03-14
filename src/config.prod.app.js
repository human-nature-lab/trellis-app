const constants = require('./static/constants')

module.exports = {
  appEnv: constants.APP_ENV.CORDOVA,
  appMode: constants.APP_MODE.PROD,
  debug: false,
  xKey: 'rXghvr7C1Q8dRmhX2Lyl3wC62TyoAr95',
  apiRoot: 'https://api.trellisprod.net',
  database: {
    logging: ['warning', 'error']
  },
  logging: {
    levels: ['warn', 'error']
  },
  mapTileLayer: {
    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.emerald',
    accessToken: 'pk.eyJ1IjoiZGlzcGVyc2UiLCJhIjoiSUtqRFhKZyJ9.eixdwJkaNkCiPPWew9i4pQ',
    style: 'mapbox://styles/mapbox/streets-v10'
  },
  sentry: {
    dsn: 'https://9a69dfd63e02433386c0f98af65354d0@sentry.io/1382345',
    onlineIntervalRate: 2 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}
