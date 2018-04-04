import switchByModeEnv from '@/services/util'
import RespondentServiceWeb from './RespondentServiceWeb'
import RespondentServiceCordova from './RespondentServiceCordova'

let Constructor = switchByModeEnv({
  WEB: RespondentServiceWeb,
  CORDOVA: RespondentServiceCordova
})

export const RespondentService = new Constructor()

export default RespondentService
