import switchByModeEnv from '../util'
// import FormServiceMock from './FormServiceMock'
import FormServiceWeb from './FormServiceWeb'
import FormServiceCordova from './FormServiceCordova'

export const FormService = switchByModeEnv({
  WEB: FormServiceWeb,
  CORDOVA: FormServiceCordova
})

export default new FormService()
