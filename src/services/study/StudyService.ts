import {switchByModeEnv} from '../util'
import StudyServiceWeb from './StudyServiceWeb'
import StudyServiceCordova from './StudyServiceCordova'
import StudyServiceMock from './StudyServiceMock'
import StudyServiceAbstract from './StudyServiceAbstract'

let StudyService: StudyServiceAbstract = switchByModeEnv({
  WEB: {
    PROD: StudyServiceWeb,
    TEST: StudyServiceMock
  },
  CORDOVA: {
    PROD: StudyServiceCordova,
    TEST: StudyServiceCordova
  }
})

export default StudyService
