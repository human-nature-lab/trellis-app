import switchByModeEnv from '../util'
import SurveyServiceWeb from './SurveyServiceWeb'
import SurveyServiceCordova from './SurveyServiceCordova'

export const SurveyService = switchByModeEnv({
  WEB: SurveyServiceWeb,
  CORDOVA: SurveyServiceCordova
})

export default new SurveyService()

