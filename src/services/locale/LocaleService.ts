import { switchByModeEnv } from '../util'
import LocaleServiceWeb from './LocaleServiceWeb'
import LocaleServiceCordova from './LocaleServiceCordova'
import LocaleServiceAbstract from './LocaleServiceAbstract'

let LocaleService: LocaleServiceAbstract = switchByModeEnv({
  WEB: LocaleServiceWeb,
  CORDOVA: LocaleServiceCordova
})

export default LocaleService
