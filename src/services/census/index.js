import switchByModeEnv from '../util'
import CensusServiceWeb from './CensusService.web'

export const CensusService = switchByModeEnv({
  WEB: {
    PROD: CensusServiceWeb,
    TEST: CensusServiceWeb
  }
})

export default CensusService

