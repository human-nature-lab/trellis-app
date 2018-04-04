import config from '@/config'
import constants from '@/constants'
import FormServiceMock from './FormServiceMock'
import FormServiceWeb from './FormServiceWeb'

export const FormService = (config.appMode === constants.APP_MODE.TEST) ? FormServiceMock : FormServiceWeb
export default FormService
