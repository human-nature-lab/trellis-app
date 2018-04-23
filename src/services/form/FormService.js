import switchByModeEnv from '@/services/util'
import FormServiceMock from './FormServiceMock'
import FormServiceWeb from './FormServiceWeb'
import FormServiceCordova from './FormServiceCordova'

export const FormService = switchByModeEnv({
  WEB: {
    PROD: FormServiceWeb,
    TEST: FormServiceMock
  },
  CORDOVA: {
    PROD: FormServiceCordova,
    TEST: FormServiceMock
  }
})
export default FormService
