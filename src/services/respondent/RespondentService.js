import switchByModeEnv from '@/services/util'
import RespondentServiceWeb from './RespondentServiceWeb'
import RespondentServiceCordova from './RespondentServiceCordova'
import RespondentServiceMock from './RespondentServiceMock'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: RespondentServiceWeb,
    TEST: RespondentServiceMock
  },
  CORDOVA: {
    PROD: RespondentServiceCordova,
    TEST: RespondentServiceMock
  }
})

export const RespondentService = new Constructor()

export default RespondentService
