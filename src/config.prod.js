import constants from './static/constants'

const config = {
  appEnv: (typeof cordova === 'object') ? constants.APP_ENV.CORDOVA : constants.APP_ENV.WEB,
  appMode: constants.APP_MODE.PROD,
  xKey: 'rXghvr7C1Q8dRmhX2Lyl3wC62TyoAr95',
  apiRoot: 'https://api.trellisprod.net'
}

export default config
