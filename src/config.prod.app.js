const constants = require('./static/constants')

module.exports = {
  appEnv: constants.APP_ENV.CORDOVA,
  appMode: constants.APP_MODE.PROD,
  debug: false,
  xKey: '***REMOVED***',
  apiRoot: 'https://api.***REMOVED***',
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
    accessToken: '***REMOVED***',
    style: 'mapbox://styles/mapbox/streets-v10'
  },
  sentry: {
    dsn: '***REMOVED***',
    onlineIntervalRate: 2 * 60 * 1000,    // frequency to check if we can send offline logs
    offline: true                         // True if we're using the offline integration
  }
}
