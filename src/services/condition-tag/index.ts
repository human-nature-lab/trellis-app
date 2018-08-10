import switchByModeEnv from '../util'
import ConditionTagWeb from './ConditionTagWeb'
import ConditionTagCordova from './ConditionTagCordova'

let Constructor = switchByModeEnv({
  WEB: ConditionTagWeb,
  CORDOVA: ConditionTagCordova
})

export const ConditionTag = Constructor

export default ConditionTag
