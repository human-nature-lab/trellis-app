import switchByModeEnv from '../../services/util'
import GeoServiceWeb from './GeoServiceWeb'
import GeoServiceCordova from './GeoServiceCordova'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: GeoServiceWeb,
    TEST: GeoServiceWeb
  },
  CORDOVA: {
    PROD: GeoServiceCordova,
    TEST: GeoServiceCordova
  }
})

export const GeoService = Constructor

export default GeoService
