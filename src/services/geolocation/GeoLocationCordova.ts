import DeviceService from '../device'
import GeoLocationAbstract from './GeoLocationAbstract'

export default class GeoLocationCordova extends GeoLocationAbstract {
  async getCurrentPosition () {
    let isReady = await DeviceService.isDeviceReady()
    if (!!isReady) {
      return super.getCurrentPosition()
    } else {
      throw new Error(`Device was not ready. ${isReady}`)
    }
  }
}
