import switchByModeEnv from '@/services/util'
// import InterviewDataWeb from './InterviewDataWeb'
import InterviewDataMock from './InterviewdataMock'
import InterviewDataCordova from './InterviewDataCordova'

let Constructor = switchByModeEnv({
  WEB: {
    TEST: InterviewDataMock,
    PROD: InterviewDataMock
  },
  CORDOVA: {
    TEST: InterviewDataMock,
    PROD: InterviewDataCordova
  }
})

export const InterviewService = Constructor
export default InterviewService
