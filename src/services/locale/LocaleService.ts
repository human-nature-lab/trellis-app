import {switchByModeEnv} from '../util'
import LocaleServiceWeb from './LocaleServiceWeb'
import LocaleServiceCordova from './LocaleServiceCordova'
import LocaleServiceAbstract from './LocaleServiceAbstract'

let LocaleService: LocaleServiceAbstract = switchByModeEnv({
  WEB: {
    PROD: LocaleServiceWeb,
    TEST: LocaleServiceWeb
  },
  CORDOVA: {
    PROD: LocaleServiceCordova,
    TEST: LocaleServiceCordova
  }
})

export default LocaleService
