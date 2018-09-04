import switchByModeEnv from '../util'
import RosterServiceWeb from './RosterServiceWeb'
import RosterServiceCordova from './RosterServiceCordova'

export const RosterService = switchByModeEnv({
  WEB: RosterServiceWeb,
  CORDOVA: RosterServiceCordova
})

export default new RosterService()
