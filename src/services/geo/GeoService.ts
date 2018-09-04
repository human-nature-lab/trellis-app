import switchByModeEnv from '../../services/util'
import GeoServiceWeb from './GeoServiceWeb'
import GeoServiceCordova from './GeoServiceCordova'

let Constructor = switchByModeEnv({
  WEB: GeoServiceWeb,
  CORDOVA: GeoServiceCordova
})

export const GeoService = Constructor

export default GeoService
