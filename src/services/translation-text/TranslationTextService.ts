import switchByModeEnv from '../../services/util'
import TranslationTextServiceWeb from './TranslationTextServiceWeb'
import TranslationTextServiceCordova from './TranslationTextServiceCordova'

export const TranslationTextService = switchByModeEnv({
  WEB: TranslationTextServiceWeb,
  CORDOVA: TranslationTextServiceCordova
})

export default new TranslationTextService()
