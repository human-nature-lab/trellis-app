import switchByModeEnv from '@/services/util'
import InterviewActionsWeb from './InterviewActionsWeb'
import InterviewActionsMock from './InterviewActionsMock'
import InterviewActionsCordova from './InterviewActionsCordova'

let Constructor = switchByModeEnv({
  WEB: {
    TEST: InterviewActionsMock,
    PROD: InterviewActionsWeb
  },
  CORDOVA: InterviewActionsCordova
})

export const InterviewActionsService = Constructor
export default InterviewActionsService
