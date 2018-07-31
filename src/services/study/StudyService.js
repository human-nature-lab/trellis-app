import {switchByModeEnv} from '../util'
import StudyServiceWeb from './StudyServiceWeb'
// import StudyServiceCordova from './StudyServiceCordova'
import StudyServiceMock from './StudyServiceMock'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: StudyServiceWeb,
    TEST: StudyServiceMock
  },
  CORDOVA: {
    PROD: StudyServiceMock,
    TEST: StudyServiceMock
  }
})

export const StudyService = Constructor

export default StudyService
