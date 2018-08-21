import switchByModeEnv from '../util'
import RespondentServiceWeb from './RespondentServiceWeb'
import RespondentServiceCordova from './RespondentServiceCordova'
import RespondentServiceMock from './RespondentServiceMock'

export const RespondentService = switchByModeEnv({
  WEB: {
    PROD: RespondentServiceWeb,
    TEST: RespondentServiceMock
  },
  CORDOVA: {
    PROD: RespondentServiceCordova,
    TEST: RespondentServiceMock
  }
})

export default new RespondentService()
