import switchByModeEnv from '@/services/util'
import RosterServiceWeb from './RosterServiceWeb'
import RosterServiceCordova from './RosterServiceCordova'
import RosterServiceMock from './RosterServiceMock'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: RosterServiceWeb,
    TEST: RosterServiceMock
  },
  CORDOVA: {
    PROD: RosterServiceCordova,
    TEST: RosterServiceMock
  }
})

export const RosterService = Constructor

export default RosterService
