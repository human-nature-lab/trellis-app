import switchByModeEnv from '../util'
import RosterServiceWeb from './RosterServiceWeb'
import RosterServiceCordova from './RosterServiceCordova'

let Constructor = switchByModeEnv({
  WEB: RosterServiceWeb,
  CORDOVA: RosterServiceCordova
})

export const RosterService = Constructor

export default new RosterService()
