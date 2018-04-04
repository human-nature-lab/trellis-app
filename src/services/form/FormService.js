import config from '@/config'
import { APP_MODE } from '@/constants'
import FormServiceMock from './FormServiceMock'
import FormServiceWeb from './FormServiceWeb'

export const FormService = (config.appMode === APP_MODE.TEST) ? FormServiceMock : FormServiceWeb
export default FormService
