import switchByModeEnv from '../util'
import InterviewServiceWeb from './InterviewServiceWeb'
// import InterviewServiceMock from './InterviewServiceMock'
import InterviewServiceCordova from './InterviewServiceCordova'

export const InterviewService = switchByModeEnv({
  WEB: InterviewServiceWeb,
  CORDOVA: InterviewServiceCordova
})

export default new InterviewService()
