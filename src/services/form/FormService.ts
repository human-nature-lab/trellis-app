import switchByModeEnv from '../util'
import FormServiceMock from './FormServiceMock'
import FormServiceWeb from './FormServiceWeb'
import FormServiceCordova from './FormServiceCordova'

export const FormService = switchByModeEnv({
  WEB: {
    PROD: FormServiceWeb,
    TEST: FormServiceMock
  },
  CORDOVA: FormServiceCordova
})

export default new FormService()
