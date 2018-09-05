import switchByModeEnv from '../util'
import CensusServiceWeb from './CensusServiceWeb'
import CensusServiceCordova from './CensusServiceCordova'

export const CensusService = switchByModeEnv({
  WEB: CensusServiceWeb,
  CORDOVA: CensusServiceCordova
})

export default new CensusService()

