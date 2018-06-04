import switchByModeEnv from '@/services/util'
import GeoServiceWeb from './GeoServiceWeb'
// import GeoServiceMock from './GeoServiceMock'
// import GeoServiceCordova from './GeoServiceCordova'

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
