import constants from './static/constants'
/* global cordova */
export default {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.TEST,
  debug: true,
  xKey: '***REMOVED***',
  apiRoot: 'http://10.0.1.201',
  formBuilderUrl: 'http://trellisandroid.net/#/form/{form_id}/builder?token={token}&study={study}&locale={locale}',
  mapTileLayer: {
    url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.emerald',
    accessToken: '',
    style: 'mapbox://styles/mapbox/streets-v10'
  },
  logging: {
    console: true,    // default true
    rate: 500,        // default: 0 -> messages are written to disk immediately
    levels: [],       // default: null -> all messages are written to disk
    max: 100          // default: 0 -> infinite logs
  },
  sentry: {           // Optional sentry configuration options like dsn
    dsn: '',                            // Sentry DSN value
    offline: false,                     // Use offline integration
    onlineIntervalRate: 1 * 60 * 1000   // The amount of time to wait between checks for online status
  }
}

