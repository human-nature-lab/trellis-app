import switchByModeEnv from '../util'
import RespondentServiceWeb from './RespondentServiceWeb'
import RespondentServiceCordova from './RespondentServiceCordova'
// import RespondentServiceMock from './RespondentServiceMock'

export const RespondentService = switchByModeEnv({
  WEB: {
    PROD: RespondentServiceWeb,
    TEST: RespondentServiceWeb
  },
  CORDOVA: {
    PROD: RespondentServiceCordova,
    TEST: RespondentServiceCordova
  }
})

export default new RespondentService()
