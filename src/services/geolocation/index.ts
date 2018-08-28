import switchByEnv from '../util'
import GeoLocationWeb from "./GeoLocationWeb";
import GeoLocationCordova from "./GeoLocationCordova";

const GeoLocationService = switchByEnv({
  WEB: GeoLocationWeb,
  CORDOVA: GeoLocationCordova
})

export default new GeoLocationService()
