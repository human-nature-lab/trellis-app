import switchByModeEnv from '../util'
import InterviewServiceWeb from './InterviewServiceWeb'
import InterviewServiceMock from './InterviewServiceMock'
import InterviewServiceCordova from './InterviewServiceCordova'

export const InterviewService = switchByModeEnv({
  WEB: {
    TEST: InterviewServiceMock,
    PROD: InterviewServiceWeb
  },
  CORDOVA: InterviewServiceCordova
})

export default new InterviewService()
