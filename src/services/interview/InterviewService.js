import switchByModeEnv from '@/services/util'
import InterviewServiceWeb from './InterviewServiceWeb'
import InterviewServiceMock from './InterviewServiceMock'
import InterviewServiceCordova from './InterviewServiceCordova'

let Constructor = switchByModeEnv({
  WEB: {
    TEST: InterviewServiceMock,
    PROD: InterviewServiceWeb
  },
  CORDOVA: InterviewServiceCordova
})

export const InterviewService = Constructor
export default InterviewService
