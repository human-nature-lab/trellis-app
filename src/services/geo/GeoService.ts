import switchByModeEnv from '../../services/util'
import GeoServiceWeb from './GeoServiceWeb'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: GeoServiceWeb,
    TEST: GeoServiceWeb
  },
  CORDOVA: {
    PROD: GeoServiceWeb,
    TEST: GeoServiceWeb
  }
})

export const GeoService = Constructor

export default GeoService
