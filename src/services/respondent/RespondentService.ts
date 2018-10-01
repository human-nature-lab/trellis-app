import switchByModeEnv from '../util'
import RespondentServiceWeb from './RespondentServiceWeb'
import RespondentServiceCordova from './RespondentServiceCordova'
// import RespondentServiceMock from './RespondentServiceMock'

export const RespondentService = switchByModeEnv({
  WEB: RespondentServiceWeb,
  CORDOVA: RespondentServiceCordova
})

export default new RespondentService()
