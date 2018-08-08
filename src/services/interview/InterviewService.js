import switchByModeEnv from '@/services/util'
import InterviewServiceWeb from './InterviewServiceWeb'
import InterviewServiceMock from './InterviewServiceMock'
import InterviewServiceCordova from './InterviewServiceCordova'

export default switchByModeEnv({
  WEB: {
    TEST: InterviewServiceMock,
    PROD: InterviewServiceWeb
  },
  CORDOVA: InterviewServiceCordova
})
