import switchByModeEnv from '../util'
import GeoServiceWeb from './GeoServiceWeb'
import GeoServiceCordova from './GeoServiceCordova'

export const GeoService = switchByModeEnv({
  WEB: GeoServiceWeb,
  CORDOVA: GeoServiceCordova
})

export default new GeoService()
