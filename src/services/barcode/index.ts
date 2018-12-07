import switchByModeEnv from '../util'
import BarcodeServiceWeb from './BarcodeServiceWeb'
import BarcodeServiceCordova from './BarcodeServiceCordova'

export const BarcodeService = switchByModeEnv({
  WEB: BarcodeServiceWeb,
  CORDOVA: BarcodeServiceCordova
})

export default new BarcodeService()

