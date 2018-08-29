import {switchByModeEnv} from '../util'
import StudyServiceWeb from './StudyServiceWeb'
import StudyServiceCordova from './StudyServiceCordova'
import StudyServiceMock from './StudyServiceMock'

const StudyService = switchByModeEnv({
  WEB: {
    PROD: StudyServiceWeb,
    TEST: StudyServiceMock
  },
  CORDOVA: StudyServiceCordova
})

export default new StudyService()
