import switchByModeEnv from '@/services/util'
import LocaleServiceWeb from './LocaleServiceWeb'
// import LocaleServiceMock from './LocaleServiceMock'
// import LocaleServiceCordova from './LocaleServiceCordova'

let Constructor = switchByModeEnv({
  WEB: {
    PROD: LocaleServiceWeb,
    TEST: LocaleServiceWeb
  },
  CORDOVA: {
    PROD: LocaleServiceWeb,
    TEST: LocaleServiceWeb
  }
})

export const LocaleService = Constructor

export default LocaleService
